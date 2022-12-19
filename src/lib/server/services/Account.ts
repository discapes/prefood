import { z } from "zod";

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

export const AuthToken = z.string();
export type AuthToken = z.infer<typeof AuthToken>;

export const ApiKey = z.string();
export type ApiKey = z.infer<typeof ApiKey>;

export const Auth = z.union([
	z.object({
		type: z.literal("AuthToken"),
		authToken: AuthToken,
	}),
	z.object({
		type: z.literal("ApiKey"),
		apiKey: ApiKey,
	}),
]);
export type Auth = z.infer<typeof Auth>;

export type Edits = Pick<Partial<DBAccount>, "picture" | "bio" | "name" | "username">;
