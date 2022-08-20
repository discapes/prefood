import type { RequestHandler } from "./$types";
import { OAuth2Client } from "google-auth-library";
import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import { SESSION_MAXAGE_HOURS } from "$env/static/private";
import * as cookie from "cookie";
import { createAccountFromGooglePayload, getUserID, addNewSessionID } from "$lib/authentication";
import { error } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, url }) => {
	const { tokenID, rememberMe } = Object.fromEntries(await request.formData());
	if (!tokenID) throw error(400, "tokenID not specified.");
	if (!rememberMe) throw error(400, "rememberMe not specified.");

	const { googleID, payload: g_payload } = await verify(<string>tokenID);

	let userID = await getUserID({ idFieldName: "googleID", idValue: googleID });
	let newSessionID: string;
	if (userID) {
		newSessionID = await addNewSessionID({ userID });
	} else {
		({ userID, initialSessionID: newSessionID } = await createAccountFromGooglePayload({ googleID, g_payload }));
	}

	const cookieOpts: cookie.CookieSerializeOptions = {
		maxAge: rememberMe == "true" ? +SESSION_MAXAGE_HOURS * 60 * 60 : undefined,
		path: "/",
	};

	const headers = new Headers({
		location: request.headers.get("Referer") ?? url.href,
	});
	headers.append("set-cookie", cookie.serialize("userID", userID, cookieOpts));
	headers.append("set-cookie", cookie.serialize("sessionID", newSessionID, cookieOpts));

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
		if (!payload) throw error(400, "payload not defined");

		const googleID = payload["sub"];
		return { googleID, payload };
	}
};
