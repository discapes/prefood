import type { AccountCreationData, TrustedIdentity } from "$lib/types/misc";
import { firstTrue, log } from "$lib/util";
import { error } from "@sveltejs/kit";
import { uuid } from "$lib/util";
import { hash } from "../crypto";
import { ddb, Table } from "../ddb";
import { Account } from "../../types/Account";
import type { DBAccount, Edits, AuthToken, APIToken } from "./Account";

class AccountsService {
	table = new Table<DBAccount>("users").key("userID").clone();

	async deleteUser(auth: AuthToken) {
		await this.table().condition(this.#getAuthCondition(auth, "delete")).deleteItem(auth.UID);
	}

	getScopes(auth: AuthToken | APIToken, user: DBAccount): Set<string> {
		if (auth.type === "AuthToken") {
			if (user.sessionTokens?.has(hash(auth.SID))) return new Set(["*"]);
			else throw error(400, "Couldn't find scopes for AuthToken.");
		} else {
			if (user.apiKeys?.[auth.apiKey]) return user.apiKeys?.[auth.apiKey];
			else throw error(400, "Couldn't find scopes for APIToken.");
		}
	}

	async fetchScopes(auth: AuthToken | APIToken): Promise<Set<string>> {
		const ud = await this.table().getItem(auth.UID);
		if (ud) return this.getScopes(auth, ud);
		else throw error(400, "Couldn't find user.");
	}

	async fetchScopedData(auth: AuthToken): Promise<Account>;
	async fetchScopedData(auth: APIToken): Promise<Partial<Account>>;
	async fetchScopedData(auth: AuthToken | APIToken): Promise<Partial<Account>> {
		const userData = await this.table().getItem(auth.UID);
		if (!userData) throw error(400, "Couldn't find user.");
		const scopes = this.getScopes(auth, userData);
		if (scopes.has("*")) {
			return Account.parse(userData);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const scopedEntries: any = [...Object.entries(userData)]
				.map(([k, v]) => {
					return scopes.has(k + ":read") ? [k, v] : undefined;
				})
				.filter((i) => i != undefined);
			return <Partial<Account>>Object.fromEntries(scopedEntries);
		}
	}

	async fetchInternalData(auth: AuthToken): Promise<DBAccount> {
		const userData = await this.table().getItem(auth.UID);
		if (!userData || !userData?.sessionTokens?.has(hash(auth.SID))) throw error(400, "Couldn't access user.");
		return userData;
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
	async unlink(auth: AuthToken | APIToken, method: string) {
		if (!["googleID", "githubID"].includes(method)) throw error(400, "Invalid method: " + method);
		await this.table()
			.condition(this.#getAuthCondition(auth, "unlink"))
			.remove(ddb`#${method}`)
			.updateItem(auth.UID);
	}
	async addSessionToken(UID: string) {
		const newSessionToken = uuid();
		await this.table()
			.add(ddb`sessionTokens :${new Set([hash(newSessionToken)])}`)
			.updateItem(UID);
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
	#getAuthCondition(auth: AuthToken | APIToken, scope: string) {
		return auth.type === "AuthToken" ? ddb`contains(sessionTokens, :${hash(auth.SID)})` : ddb`contains(apiKeys.#${auth.apiKey}, :${scope})`;
	}
	async setAttribute(auth: AuthToken | APIToken, { key, value }: { key: string; value: unknown }) {
		await this.table()
			.condition(this.#getAuthCondition(auth, key + ":write"))
			.set(ddb`#${key} = :${value}`)
			.updateItem(auth.UID);
	}

	async setApiKey(auth: AuthToken, { key, scopes }: { key: string; scopes: Set<string> }) {
		const p1 = this.table()
			.condition(ddb`contains(sessionTokens, :${hash(auth.SID)})`)
			.and(ddb`attribute_not_exists(apiKeys)`)
			.set(ddb`apiKeys = :${{ [key]: scopes }}`)
			.return("UPDATED_NEW")
			.updateItem(auth.UID)
			.catch(() => undefined);
		const p2 = this.table()
			.condition(ddb`contains(sessionTokens, :${hash(auth.SID)})`)
			.and(ddb`attribute_exists(apiKeys)`)
			.set(ddb`apiKeys.#${key} = :${scopes}`)
			.return("UPDATED_NEW")
			.updateItem(auth.UID)
			.catch(() => undefined);
		await firstTrue([p1, p2]);
	}
	async deleteApiKey(auth: AuthToken, key: string) {
		await this.table()
			.condition(ddb`contains(sessionTokens, :${hash(auth.SID)})`)
			.remove(ddb`apiKeys.#${key}`)
			.updateItem(auth.UID);
	}

	async edit(edits: Edits, auth: AuthToken | APIToken): Promise<boolean> {
		if (edits.username && (await this.usernameTaken(edits.username))) return false;
		const oper = this.table();
		if (auth.type === "AuthToken") {
			oper.condition(ddb`contains(sessionTokens, :${hash(auth.SID)})`);
		} else {
			Object.entries(edits).map(([key, value]) => {
				if (value != undefined) oper.and(ddb`contains(apiKeys.#${auth.apiKey}, :${key + ":write"})`);
			});
		}
		Object.entries(edits).map(([key, value]) => {
			if (value != undefined) oper.set(ddb`#${key} = :${value}`);
		});
		await oper.updateItem(auth.UID);
		return true;
	}

	async revokeLogins(auth: AuthToken) {
		const newSet = auth.type === "AuthToken" ? new Set([hash(auth.SID)]) : new Set([]);
		await this.table()
			.condition(this.#getAuthCondition(auth, "revoke"))
			.set(ddb`sessionTokens = :${newSet}`)
			.updateItem(auth.UID);
	}

	async create(acd: AccountCreationData) {
		if (
			await this.existsTI({
				methodName: "email",
				methodValue: acd.email,
			})
		)
			throw error(400, "This email already linked to another authentication method, meaning you have an account that uses another method.");

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
