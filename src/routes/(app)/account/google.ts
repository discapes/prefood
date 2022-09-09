import { GOOGLE_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import { URLS } from "$lib/addresses";
import { AccountCreationData, TrustedIdentity } from "$lib/types";
import { error } from "@sveltejs/kit";
import jwtDecode from "jwt-decode";
import { log } from "$lib/util";

export async function verifyGoogleIdentity(
	url: URL
): Promise<{ i: TrustedIdentity; getACD: () => Promise<AccountCreationData> }> {
	const code = url.searchParams.get("code");
	log("verifySenderGoogle", { code });
	if (typeof code !== "string") throw error(400, "code is undefined");

	const atParams = new URLSearchParams({
		client_id: PUBLIC_GOOGLE_CLIENT_ID,
		client_secret: GOOGLE_CLIENT_SECRET,
		code,
		grant_type: "authorization_code",
		redirect_uri: new URL(URLS.LOGIN, url).href, // useless
	});

	const acd = await fetch(`https://oauth2.googleapis.com/token?${atParams}`, {
		method: "POST",
		headers: {
			Accept: "application/json",
		},
	})
		.then((res) => res.json())
		.then((o) => jwtDecode(o.id_token)) // we can use any below as optional chaining is safe
		.then((payload: any) =>
			AccountCreationData.parse({
				name: payload?.name,
				email: payload?.email,
				picture: payload?.picture,
				methodValue: payload?.sub,
				methodName: "googleID",
			})
		);

	log(`got profile info `, acd);

	return {
		i: acd,
		getACD: async () => acd,
	};
}
