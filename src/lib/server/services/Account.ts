import { error } from "@sveltejs/kit";

export type DBAccount = {
	userID: string;
	googleID?: string;
	githubID?: string;
	username: string;
	bio?: string;
	name: string;
	email: string;
	picture: string | Uint8Array;
	stripeCustomerID?: string;
	sessionTokens?: Set<string>;
	apiKeys?: Record<string, Set<string>>;
};

const SEP = "#";

export class AuthToken {
	type = "AuthToken" as const;
	token: string;

	static parse(token: string | undefined) {
		if (token && token.indexOf(SEP) !== -1) {
			return new AuthToken({ UID: token.slice(0, token.indexOf(SEP)), SID: token.slice(token.indexOf(SEP) + 1) });
		} else {
			throw error(400, "Failed to parse AuthToken");
		}
	}

	constructor({ UID, SID }: { UID: string; SID: string }) {
		this.token = UID + SEP + SID;
	}

	toString() {
		return this.token;
	}

	get UID() {
		return this.token.slice(0, this.token.indexOf(SEP));
	}
	get SID() {
		return this.token.slice(this.token.indexOf(SEP) + 1);
	}
}

export class APIToken {
	type = "APIToken" as const;
	token: string;

	static parse(token: string) {
		if (token.indexOf(SEP) !== -1) {
			return new APIToken({ UID: token.slice(0, token.indexOf(SEP)), apiKey: token.slice(token.indexOf(SEP)) + 1 });
		}
	}

	constructor({ UID, apiKey }: { UID: string; apiKey: string }) {
		this.token = UID + SEP + apiKey;
	}

	get UID() {
		return this.token.slice(0, this.token.indexOf(SEP));
	}
	get apiKey() {
		return this.token.slice(this.token.indexOf(SEP) + 1);
	}
}

export type Edits = Pick<Partial<DBAccount>, "picture" | "bio" | "name" | "username">;
