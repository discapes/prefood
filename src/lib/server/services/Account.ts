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

export type Edits = Pick<Partial<DBAccount>, "picture" | "bio" | "name" | "username">;
