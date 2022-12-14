import type { AccountCreationData, TrustedIdentity } from "$lib/types/misc";
import { firstTrue, log } from "$lib/util";
import { error } from "@sveltejs/kit";
import { uuid } from "$lib/util";
import { hash } from "../crypto";
import { ddb, Table } from "../ddb";
import { Account } from "../../types/Account";
import type { DBAccount, Auth, UserAuth, OAuth, Edits } from "./Account";

class AccountsService {
	table = new Table<DBAccount>("users").key("userID").clone();

	parseUIDFromAuth(auth: Auth) {
		if ("apiKey" in auth) {
			return auth.apiKey.slice(0, auth.apiKey.indexOf("-"));
		} else {
			return auth.userID;
		}
	}
	async delete(auth: Auth) {
		await this.table().condition(this.#getAuthCondition(auth, "delete")).deleteItem(this.parseUIDFromAuth(auth));
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
	async fetchScopedData(auth: UserAuth): Promise<Account | undefined>;
	async fetchScopedData(auth: OAuth): Promise<Partial<Account> | undefined>;
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
	async fetchAllData(auth: UserAuth): Promise<DBAccount | undefined> {
		const userData = await this.table().getItem(auth.userID);
		if (!userData) return undefined;
		const scopes = this.getScopes(auth, userData);
		if (scopes?.has("*")) {
			return userData;
		}
	}
	async fetchUIDForTI(ti: TrustedIdentity): Promise<string | undefined> {
		return this.fetchUIDWithIndex(ti.methodName, ti.methodValue);
	}
	async fetchUIDWithIndex(index: TrustedIdentity["methodName"] | "username", value: string): Promise<string | undefined> {
		const res = await this.table()
			.index(`${index}-index`)
			.project(["userID"])
			.queryItems(ddb`#${index} = :${value}`);
		return res[0]?.userID;
	}
	async existsTI(ti: TrustedIdentity): Promise<boolean> {
		return !!(await this.fetchUIDForTI(ti));
	}
	async exists(index: TrustedIdentity["methodName"] | "username", value: string): Promise<boolean> {
		return !!(await this.fetchUIDWithIndex(index, value));
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
	#getAuthCondition(auth: Auth, scope: string) {
		return this.isUserAuth(auth) ? ddb`contains(sessionTokens, :${hash(auth.sessionToken)})` : ddb`contains(apiKeys.#${auth.apiKey}, :${scope})`;
	}
	async setAttribute(auth: Auth, { key, value }: { key: string; value: unknown }) {
		await this.table()
			.condition(this.#getAuthCondition(auth, key + ":write"))
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
			.remove(ddb`apiKeys.#${key}`)
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
				if (value != undefined) oper.and(ddb`contains(apiKeys.#${auth.apiKey}, :${key + ":write"})`);
			});
		}
		Object.entries(edits).map(([key, value]) => {
			if (value != undefined) oper.set(ddb`#${key} = :${value}`);
		});
		await oper.updateItem(userID);
		return true;
	}
	async revoke(auth: Auth) {
		const newSet = this.isUserAuth(auth) ? new Set([hash(auth.sessionToken)]) : new Set([]);
		await this.table()
			.condition(this.#getAuthCondition(auth, "revoke"))
			.set(ddb`sessionTokens = :${newSet}`)
			.updateItem(this.parseUIDFromAuth(auth));
	}
	async create(acd: AccountCreationData) {
		if (
			await this.existsTI({
				methodName: "email",
				methodValue: acd.email,
			})
		)
			throw error(400, "email already linked");
		let username = acd.name.replaceAll(" ", "");
		while (await this.exists("username", username)) {
			username += Math.floor(Math.random() * 10);
		}
		const userID = uuid();
		const initialSessionToken = uuid();
		log(`Creating account with ${JSON.stringify({ userID, acd, initialSessionToken })}`);
		const oper = this.table()
			.set(ddb`#${"sessionTokens"} = :${new Set([hash(initialSessionToken)])}`)
			.set(ddb`#${"username"} = :${username}`)
			.set(ddb`#${"name"} = :${acd.name}`)
			.set(ddb`#${"email"} = :${acd.email}`)
			.set(ddb`#${"picture"} = :${acd.picture}`);

		if (acd.methodName !== "email") oper.set(ddb`#${acd.methodName} = :${acd.methodValue}`);
		await oper.updateItem(userID);
		return { userID, initialSessionToken };
	}
}
export default new AccountsService();
