import { loginWithEmail } from "$lib/authentication";
import { falsePropNames, log } from "$lib/util";
import { error } from "@sveltejs/kit";
import type { LinkAccountButtonOptions, SignInButtonOptions } from "src/types/types";
import type { RequestHandler } from "./$types";

export const prerender = false;

export const GET: RequestHandler = async ({ url, locals: { userID, sessionID } }) => {
	log("email login requested");
	type FWDData = SignInButtonOptions | LinkAccountButtonOptions;

	const email = <string>url.searchParams.get("email");
	const { referer, opts: forwardedData }: { opts: FWDData; referer: string } = JSON.parse(<string>url.searchParams.get("options"));
	const fpn = falsePropNames({ email, forwardedData, referer });
	if (fpn.length) throw error(400, `invalid request: ${fpn} are undefined`);
	else log({ email, forwardedData, referer });

	if ("rememberMe" in forwardedData) {
		return new Response(
			await loginWithEmail({
				email,
				rememberMe: forwardedData.rememberMe,
				referer,
				endpoint: new URL("/account/login/email/link", referer).href,
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
