import type { Modify } from "$lib/util";
import { z } from "zod";

export const Account = z
	.object({
		username: z.string(),
		userID: z.string(),
		googleID: z.string().nullish(),
		githubID: z.string().nullish(),
		bio: z.string().nullish(),
		name: z.string(),
		email: z.string(),
		picture: z.string().or(z.instanceof(Uint8Array)),
		apiKeys: z.record(z.set(z.string())).nullish(),
	})
	.transform((ac) => {
		if (typeof ac.picture === "object") ac.picture = "data:image/webp;base64," + Buffer.from(ac.picture).toString("base64");
		return <Modify<typeof ac, { picture: string }>>ac;
	});
export type Account = z.infer<typeof Account>;

export const SCOPES: {
	fields: Record<
		string,
		{
			read?: boolean;
			write?: boolean;
			required?: boolean;
		}
	>;
	actions: Record<string, string>;
} = {
	fields: {
		userID: {
			read: true,
			required: true,
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
export const MINSCOPES = new Set([...Object.entries(SCOPES.fields)].filter(([, { required }]) => required).map(([f]) => f + ":read"));
export const MAXSCOPES = new Set(
	[...Object.entries(SCOPES.fields)]
		.flatMap(([f, { read, write }]) => {
			const s = read ? [f + ":read"] : [];
			if (write) s.push(f + ":write");
			return s;
		})
		.concat(...Object.keys(SCOPES.actions))
);
