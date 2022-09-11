import type { Modify } from "$lib/util";
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
export const Account = z
	.object({
		username: z.string(),
		userID: z.string(),
		googleID: z.string().optional(),
		githubID: z.string().optional(),
		bio: z.string().optional(),
		name: z.string(),
		email: z.string(),
		picture: z.string().or(z.instanceof(Uint8Array)),
		apiKeys: z.record(z.set(z.string())).optional(),
	})
	.transform((ac) => {
		if (typeof ac.picture === "object")
			ac.picture = "data:image/webp;base64," + Buffer.from(ac.picture).toString("base64");
		return <Modify<typeof ac, { picture: string }>>ac;
	});
export type Account = z.infer<typeof Account>;

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

export const SCOPES: {
	fields: Record<
		string,
		{
			read?: boolean;
			write?: boolean;
			forced?: boolean;
		}
	>;
	actions: Record<string, string>;
} = {
	fields: {
		userID: {
			read: true,
			forced: true,
		},
		email: {
			read: true,
		},
		username: {
			read: true,
			write: true,
		},
		picture: {
			read: true,
			write: true,
		},
		name: {
			read: true,
			write: true,
		},
		bio: {
			read: true,
			write: true,
		},
	},
	actions: {
		revoke: "Revoke all logins and API keys",
		delete: "Delete this account irreverseably",
	},
};
