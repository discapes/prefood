import type { AccountCreationData, TrustedIdentity } from "$lib/types";
import { firstTrue, log } from "$lib/util";
import { error } from "@sveltejs/kit";
import { v4 as uuid, v4 as uuidv4 } from "uuid";
import { hash } from "../server/crypto";
import { ddb, Table, type Expression } from "../server/ddb";
import { type DBAccount, type Auth, type Edits, type UserAuth, Account } from "./Account";
import AccountService from "$lib/services/AccountService";

class AccountsService {
	table = new Table<DBAccount>("users").key("userID").clone();

	parseUIDFromAuth(auth: Auth) {
		if ("apiKey" in auth) {
			return auth.apiKey.slice(0, auth.apiKey.indexOf("-"));
		} else {
			return auth.userID;
		}
	}
	async delete(auth: UserAuth) {
		await this.table()
			.condition(ddb`contains(sessionTokens, :${hash(auth.sessionToken)})`)
			.deleteItem(auth.userID);
	}
	getScopes(auth: Auth, user: DBAccount): Set<string> | undefined {
		if ("sessionToken" in auth) {
			if (user.sessionTokens?.has(hash(auth.sessionToken))) return new Set(["*"]);
		} else {
			return user.apiKeys?.[auth.apiKey];
		}
		return undefined;
	}
	async fetchScopes(auth: Auth): Promise<Set<string> | undefined> {
		const ud = await this.table().getItem(this.parseUIDFromAuth(auth));
		if (ud) return this.getScopes(auth, ud);
	}
	async fetchScopedData(auth: Auth): Promise<Partial<Account> | undefined> {
		const userID = this.parseUIDFromAuth(auth);
		const userData = await this.table().getItem(userID);
		if (!userData) return undefined;
		const scopes = this.getScopes(auth, userData);
		if (!scopes) return undefined;
		if (scopes.has("*")) {
			return Account.parse(userData);
		} else if (!scopes.size) {
			return undefined;
		} else {
			const e: any = [...Object.entries(userData)]
				.map(([k, v]) => {
					return scopes.has(k + ":read") ? [k, v] : undefined;
				})
				.filter((i) => i != undefined);
			return <Partial<Account>>Object.fromEntries(e);
		}
	}
	async fetchUIDForTI(ti: TrustedIdentity): Promise<string | undefined> {
		const res = await this.table()
			.index(`${ti.methodName}-index`)
			.project(["userID"])
			.queryItems(ddb`#${ti.methodName} = :${ti.methodValue}`);
		return res[0]?.userID;
	}
	async existsTI(ti: TrustedIdentity): Promise<boolean> {
		return !!(await this.fetchUIDForTI(ti));
	}
	async existsUID(userID: string): Promise<boolean> {
		return !!(await this.table().project(["userID"]).getItem(userID));
	}
	async removeSessionToken({ sessionToken, userID }: UserAuth) {
		await this.table()
			.delete(ddb`sessionTokens :${new Set([hash(sessionToken)])}`)
			.updateItem(userID);
	}
	async addSessionToken({ userID }: { userID: string }) {
		const newSessionToken = uuid();
		await this.table()
			.add(ddb`sessionTokens :${new Set([hash(newSessionToken)])}`)
			.updateItem(userID);
		return newSessionToken;
	}
	async getPublicDataByUsername(username: string) {
		return Account.parse(
			(
				await this.table()
					.index("username-index")
					.key("username")
					.queryItems(ddb`username = :${username}`)
			)[0]
		);
	}
	async usernameTaken(username: string): Promise<boolean> {
		return !!(
			await this.table()
				.index("username-index")
				.key("username")
				.project(["userID"])
				.queryItems(ddb`username = :${username}`)
		).length;
	}
	async setAttribute(
		auth: Auth,
		{
			key,
			value,
		}: {
			key: string;
			value: unknown;
		}
	) {
		const condition = this.isUserAuth(auth)
			? ddb`contains(sessionTokens, :${hash(auth.sessionToken)})`
			: ddb`contains(apiKeys.#${auth.apiKey}, :${key + ":write"})`;
		await this.table()
			.condition(condition)
			.set(ddb`#${key} = :${value}`)
			.updateItem(this.parseUIDFromAuth(auth));
	}
	async setKey(auth: UserAuth, { key, scopes }: { key: string; scopes: Set<string> }) {
		const p1 = this.table()
			.condition(ddb`contains(sessionTokens, :${hash(auth.sessionToken)})`)
			.and(ddb`attribute_not_exists(apiKeys)`)
			.set(ddb`apiKeys = :${{ [key]: scopes }}`)
			.return("UPDATED_NEW")
			.updateItem(auth.userID)
			.catch((e) => undefined);
		const p2 = this.table()
			.condition(ddb`contains(sessionTokens, :${hash(auth.sessionToken)})`)
			.and(ddb`attribute_exists(apiKeys)`)
			.set(ddb`apiKeys.#${key} = :${scopes}`)
			.return("UPDATED_NEW")
			.updateItem(auth.userID)
			.catch((e) => undefined);
		const res = await firstTrue([p1, p2]);
	}
	async deleteKey(auth: UserAuth, key: string) {
		await this.table()
			.condition(ddb`contains(sessionTokens, :${hash(auth.sessionToken)})`)
			.delete(ddb`apiKeys.#${key}`)
			.updateItem(auth.userID);
	}
	isUserAuth(auth: Auth): auth is UserAuth {
		return "sessionToken" in auth;
	}
	async edit(edits: Edits, auth: Auth): Promise<boolean> {
		if (edits.username && (await this.usernameTaken(edits.username))) return false;
		const userID = this.parseUIDFromAuth(auth);
		let oper = this.table();
		if (this.isUserAuth(auth)) {
			oper.condition(ddb`contains(sessionTokens, :${hash(auth.sessionToken)})`);
		} else {
			Object.entries(edits).map(([key, value]) => {
				if (value != undefined)
					oper.and(ddb`contains(apiKeys.#${auth.apiKey}, :${key + ":write"})`);
			});
		}
		Object.entries(edits).map(([key, value]) => {
			if (value != undefined) oper.set(ddb`#${key} = :${value}`);
		});
		await oper.updateItem(userID);
		return true;
	}
	async create(acd: AccountCreationData) {
		if (
			await this.existsTI({
				methodName: "email",
				methodValue: acd.email,
			})
		)
			throw error(400, "email already linked");
		const userID = uuidv4();
		const initialSessionToken = uuidv4();
		log(`Creating account with ${JSON.stringify({ userID, acd, initialSessionToken })}`);
		const oper = this.table()
			.set(ddb`#${"name"} = :${acd.name}`)
			.set(ddb`#${"email"} = :${acd.email}`)
			.set(ddb`#${"picture"} = :${acd.picture}`);

		if (acd.methodName !== "email") oper.set(ddb`#${acd.methodName} = :${acd.methodValue}`);
		await oper.updateItem(userID);
		return { userID, initialSessionToken };
	}
}
export default new AccountsService();
