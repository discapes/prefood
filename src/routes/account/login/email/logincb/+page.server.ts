import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
export const prerender = false;
import { falsePropNames, log } from "$lib/util";
import { decrypt } from "$lib/crypto";
import { getUserData } from "$lib/authentication";

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	log(`email callback requested (${url})`);
	const { referer, userID, sessionID, rememberMe } = JSON.parse(decrypt(url.searchParams.get("o")!));
	const fpn = falsePropNames({ referer });
	if (fpn.length) throw error(400, `invalid request: ${fpn} are undefined`);
	else log({ referer, userID, sessionID, rememberMe });

	const userData = await getUserData({ sessionID, userID });
	if (!userData) throw error(400, "userdata not found");

	return {
		referer,
		userData,
		sessionID,
		rememberMe,
	};
};
