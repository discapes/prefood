import type { RequestHandler } from "./$types";
import { OAuth2Client } from "google-auth-library";
import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import { authenticate, linkAccount, loginWithExternalIdentity } from "$lib/authentication";
import { error, redirect } from "@sveltejs/kit";
import { GOOGLE_CLIENT_SECRET } from "$env/static/private";
import type { LinkAccountButtonOptions, SignInButtonOptions } from "src/types/types";

export const GET: RequestHandler = async ({ url, locals: { userID, sessionID } }) => {
	const requestParams = new URL(url).searchParams;
	const code = <string>requestParams.get("code");
	const state = JSON.parse(<string>requestParams.get("state") ?? "");
	const opts: SignInButtonOptions | LinkAccountButtonOptions = state.opts;
	if (!code || !state || !state.referer || !opts) throw error(400, `invalid request: ${JSON.stringify({ code, state })}`);

	const atParams = new URLSearchParams({
		client_id: PUBLIC_GOOGLE_CLIENT_ID,
		client_secret: GOOGLE_CLIENT_SECRET,
		code,
		grant_type: "authorization_code",
		redirect_uri: new URL("/account/login/google", url).href,
	});

	const atResponse = await fetch(`https://oauth2.googleapis.com/token?${atParams}`, {
		method: "POST",
		headers: {
			Accept: "application/json",
		},
	}).then((res) => res.json());

	const { googleID, payload: g_payload } = await verify(atResponse.id_token);

	if ("rememberMe" in opts) {
		return loginWithExternalIdentity({
			idFieldName: "googleID",
			idValue: googleID,
			rememberMe: opts.rememberMe,
			profileData: {
				email: g_payload.email!,
				name: g_payload.name!,
				picture: g_payload.picture!,
			},
			redirect: state.referer,
		});
	} else {
		if (userID && (await authenticate({ sessionID: sessionID, userID: userID }))) {
			linkAccount({ idFieldName: "googleID", idValue: googleID, userID });
			throw redirect(303, state.referer);
		} else {
			throw error(400, `couldn't authenticate ${JSON.stringify({ sessionID: sessionID, userID: userID })}`);
		}
	}
};

async function verify(tokenID: string) {
	//TODO replace with light jwt library
	const gClient = new OAuth2Client(PUBLIC_GOOGLE_CLIENT_ID);
	const ticket = await gClient.verifyIdToken({
		idToken: tokenID,
		audience: PUBLIC_GOOGLE_CLIENT_ID,
	});
	const payload = ticket.getPayload();
	if (!payload) throw error(400, "payload not defined");

	const googleID = payload["sub"];
	return { googleID, payload };
}
