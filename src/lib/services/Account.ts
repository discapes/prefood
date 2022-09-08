import { z } from "zod";

export type Account = {
	userID: string;
	googleID?: string;
	githubID?: string;
	name: string;
	email: string;
	picture: string;
	stripeCustomerID?: string;
	sessionTokens?: Set<string>;
	apiKeys?: ApiKey[];
};

export type ApiKey = {
	key: string;
	scopes: string[];
};

export const UserAuth = z.object({
	sessionToken: z.string(),
	userID: z.string(),
});
export type UserAuth = z.infer<typeof UserAuth>;

export const OAuth = z.object({
	apiKey: z.string(),
});
export type OAuth = z.infer<typeof OAuth>;

export const Auth = z.union([OAuth, UserAuth]);
export type Auth = z.infer<typeof Auth>;
