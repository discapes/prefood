import type { RequestHandler } from "./$types";
import jwtDecode from "jwt-decode";
import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import { linkExternalAccount, loginWithExternalIdentity } from "$lib/authentication";
import { error, redirect } from "@sveltejs/kit";
import { GOOGLE_CLIENT_SECRET } from "$env/static/private";
import type { LinkAccountButtonOptions, SignInButtonOptions } from "src/types/types";
import { decodeB64URL, falsePropNames, log } from "$lib/util";
import { decrypt } from "$lib/crypto";

async function getPayloadFromGoogleCallback(url: URL) {
	const code = <string>url.searchParams.get("code");

	const atParams = new URLSearchParams({
		client_id: PUBLIC_GOOGLE_CLIENT_ID,
		client_secret: GOOGLE_CLIENT_SECRET,
		code,
		grant_type: "authorization_code",
		redirect_uri: new URL("/account/login/google", url).href, // useless
	});

	const atResponse = await fetch(`https://oauth2.googleapis.com/token?${atParams}`, {
		method: "POST",
		headers: {
			Accept: "application/json",
		},
	}).then((res) => res.json());

	return jwtDecode(atResponse.id_token);
}

export const GET: RequestHandler = async ({ url, locals: { userID, sessionID } }) => {
	log("google callback requested");
	type FWDData = SignInButtonOptions | LinkAccountButtonOptions;

	const { sub: googleID, email, name, picture } = <any>await getPayloadFromGoogleCallback(url);
	const options: FWDData = JSON.parse(decodeB64URL(<string>url.searchParams.get("state")!));
	const fpn = falsePropNames({ googleID, email, name, picture, options });
	if (fpn.length) throw error(400, `invalid request: ${fpn} are undefined`);
	else log({ googleID, email, name, picture, options });

	if ("rememberMe" in options) {
		return loginWithExternalIdentity({
			idFieldName: "googleID",
			idValue: googleID,
			rememberMe: options.rememberMe,
			profileData: {
				email,
				name,
				picture,
			},
			redirect: new URL(options.referer, url).href,
		});
	} else {
		if (userID && sessionID) {
			linkExternalAccount({ idFieldName: "googleID", idValue: googleID, userID, sessionID });
			throw redirect(303, options.referer);
		} else {
			throw error(500, `userID or sessionID is undefined: ${JSON.stringify({ sessionID: sessionID, userID: userID })}`);
		}
	}
};
