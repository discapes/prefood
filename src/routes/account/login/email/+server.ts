import { loginWithEmail } from "$lib/authentication";
import { decodeB64URL, falsePropNames, log } from "$lib/util";
import { error } from "@sveltejs/kit";
import type { EmailSignInButtonOptions, LinkAccountButtonOptions, SignInButtonOptions } from "src/types/types";
import type { RequestHandler } from "./$types";

export const prerender = false;

export const GET: RequestHandler = async ({ url, locals: { userID, sessionID } }) => {
	log(`email login requested (${url})`);
	type FWDData = EmailSignInButtonOptions | LinkAccountButtonOptions;

	const options: FWDData = JSON.parse(decodeB64URL(<string>url.searchParams.get("state")!));
	if (!options) throw error(400, `invalid request: options are undefined`);

	if ("rememberMe" in options) {
		return new Response(
			await loginWithEmail({
				email: options.email,
				rememberMe: options.rememberMe,
				referer: new URL(options.referer, url).href,
				endpoint: new URL("/account/login/email/link", url).href,
			})
		);
	} else {
		throw error(500, "Not implemented");
		// if (userID && sessionID) {
		// 	await linkExternalAccount({ idFieldName: "githubID", idValue: githubID, userID, sessionID });
		// 	throw redirect(303, referer);
		// } else {
		// 	throw error(500, `userID or sessionID is undefined: ${JSON.stringify({ sessionID: sessionID, userID: userID })}`);
		// }
	}
};
