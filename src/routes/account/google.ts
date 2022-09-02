import jwtDecode from "jwt-decode";
import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import { error } from "@sveltejs/kit";
import { GOOGLE_CLIENT_SECRET } from "$env/static/private";
import { Identity } from "./common";

export async function getIdentityInfoGoogle(url: URL) {
	const code = url.searchParams.get("code");
	if (typeof code !== "string") throw error(400, "code is undefined");

	const atParams = new URLSearchParams({
		client_id: PUBLIC_GOOGLE_CLIENT_ID,
		client_secret: GOOGLE_CLIENT_SECRET,
		code,
		grant_type: "authorization_code",
		// redirect_uri: new URL("/account/login/google", url).href, // useless
	});

	const profileData = await fetch(`https://oauth2.googleapis.com/token?${atParams}`, {
		method: "POST",
		headers: {
			Accept: "application/json",
		},
	})
		.then((res) => res.json())
		.then((o) => jwtDecode(o.id_token)) // we can use any below as optional chaining is safe
		.then((payload: any) =>
			Identity.parse({
				name: payload?.name,
				email: payload?.email,
				picture: payload?.picture,
				methodValue: payload?.sub,
				methodName: "googleID",
			})
		);

	return profileData;
}
