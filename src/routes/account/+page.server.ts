import { getUserData } from "$lib/server/auth";
import { error, redirect } from "@sveltejs/kit";
import { z } from "zod";
import type { PageServerLoad, Actions } from "./$types";
import { removeSessionToken } from "./lib";
import cookie from "cookie";
import { log } from "$lib/util";
import { URLS } from "$lib/addresses";

export const prerender = false;

export const load: PageServerLoad = async ({ locals: { userID, sessionToken } }) => {
	return {
		userData: await getUserData({ sessionToken, userID }),
	};
};

export const Edits = z
	.object({
		name: z.string(),
		bio: z.string(),
		picture: z.string(),
	})
	.partial();

//https://github.com/sveltejs/kit/discussions/5875
export const actions: Actions = {
	logout: async ({ locals: { sessionToken, userID }, setHeaders }) => {
		if (!sessionToken) throw error(400, "sessionToken not specified.");
		if (!userID) throw error(400, "userID not specified.");
		await removeSessionToken({ userID, sessionToken });
		setHeaders({
			"set-cookie": [cookie.serialize("sessionToken", "", { maxAge: 0 }), cookie.serialize("userID", "", { maxAge: 0 })],
		});
	},
	editprofile: async ({ url, fields, locals: { sessionToken, userID } }) => {
		const edits = Edits.parse(Object.fromEntries(fields.entries()));
		log(url.pathname, { edits });
		throw error(500, "TODO");
	},
	deleteaccount: async ({ locals: { sessionToken, userID } }) => {
		log("deleteaccount");
		throw error(500, "TODO");
	},
	revoke: async ({ locals: { sessionToken, userID } }) => {
		log("revoke");
		throw error(500, "TODO");
	},
	unlink: async ({ locals: { sessionToken, userID } }) => {
		log("revoke");
		throw error(500, "TODO");
	},
};
