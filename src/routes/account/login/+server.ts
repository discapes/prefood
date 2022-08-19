import type { Action } from "./$types";
import { OAuth2Client } from "google-auth-library";
import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import { SESSION_MAXAGE_HOURS } from "$env/static/private";
import { v4 as uuidv4 } from "uuid";
import * as cookie from "cookie";
import { createOrUpdateAccount } from "$lib/authentication";
import Header from "$lib/header/Header.svelte";

export const POST: Action = async ({ request, url, setHeaders }) => {
	const { tokenID, rememberMe } = Object.fromEntries(await request.formData());
	if (!tokenID) throw new Error("Internal error: tokenID not specified.");
	if (!rememberMe) throw new Error("Internal error: rememberMe not specified.");

	const { userID, sessionID, payload } = await verify(<string>tokenID);
	await createOrUpdateAccount({ sessionID, userID, payload });

	const cookieOpts: cookie.CookieSerializeOptions = {
		maxAge: rememberMe == "true" ? +SESSION_MAXAGE_HOURS * 60 * 60 : undefined,
		path: "/",
	};

	const headers = new Headers({
		location: request.headers.get("Referer") ?? url.href,
	});
	headers.append("set-cookie", cookie.serialize("userID", userID, cookieOpts));
	headers.append("set-cookie", cookie.serialize("sessionID", sessionID, cookieOpts));

	return new Response(null, {
		status: 303,
		headers,
	});

	async function verify(tokenID: string) {
		const gClient = new OAuth2Client(PUBLIC_GOOGLE_CLIENT_ID);
		const ticket = await gClient.verifyIdToken({
			idToken: tokenID,
			audience: PUBLIC_GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();
		if (!payload) throw new Error("Error: payload not defined");

		const userID = payload["sub"];
		const sessionID = uuidv4();
		return { userID, sessionID, payload };
	}
};
