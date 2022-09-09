import type { AccountCreationData, TrustedIdentity } from "$lib/types";
import { log } from "$lib/util";
import { error } from "@sveltejs/kit";
import { v4 as uuid, v4 as uuidv4 } from "uuid";
import { hash } from "../server/crypto";
import { ddb, Table } from "../server/ddb";
import type { Account, Auth, UserAuth } from "./Account";

class AccountsService {
	table = new Table<Account>("users").key("userID").clone();

	parseUIDFromAuth(auth: Auth) {
		if ("apiKey" in auth) {
			return auth.apiKey.slice(0, auth.apiKey.indexOf("-"));
		} else {
			return auth.userID;
		}
	}
	getScopes(auth: Auth, user: Account): string[] | undefined {
		if ("sessionToken" in auth) {
			if (user.sessionTokens?.has(hash(auth.sessionToken))) return ["*"];
		} else {
			const apiKey = user.apiKeys?.find((o) => o.key === auth.apiKey);
			if (apiKey) return apiKey.scopes;
		}
		return undefined;
	}
	async fetchScopes(auth: Auth): Promise<string[] | undefined> {
		const ud = await this.table().getItem(this.parseUIDFromAuth(auth));
		if (ud) return this.getScopes(auth, ud);
	}
	async fetchScopedData(auth: Auth): Promise<Partial<Account> | undefined> {
		const userID = this.parseUIDFromAuth(auth);
		const userData = await this.table().getItem(userID);
		if (!userData) return undefined;
		const scopes = this.getScopes(auth, userData);
		if (!scopes) return undefined;
		if (scopes.includes("*")) {
			return userData;
		} else if (!scopes.length) {
			return undefined;
		} else {
			throw new Error("TODO: Not implemented");
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
	async setAttribute({
		userID,
		sessionToken,
		attribute,
		value,
	}: {
		userID: string;
		sessionToken: string;
		attribute: string;
		value: unknown;
	}): Promise<boolean> {
		if (!(await this.existsUID(userID))) return false;

		await this.table()
			.condition(ddb`contains(sessionTokens, :${sessionToken})`)
			.set(ddb`#${attribute} = :${value}`)
			.updateItem(userID);
		return true;
	}
	/* doesn't check for duplicate emails */
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
