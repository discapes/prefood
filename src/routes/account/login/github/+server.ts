import { GITHUB_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_GITHUB_CLIENT_ID } from "$env/static/public";
import { authenticate, linkAccount, loginWithExternalIdentity } from "$lib/authentication";
import { error, redirect } from "@sveltejs/kit";
import type { LinkAccountButtonOptions, SignInButtonOptions } from "src/types/types";
import type { RequestHandler } from "./$types";

export const prerender = false;

export const GET: RequestHandler = async ({ url, locals: { userID, sessionID } }) => {
	const requestParams = new URL(url).searchParams;
	const code = <string>requestParams.get("code");

	const options = JSON.parse(<string>requestParams.get("options"));
	const referer: string = options.referer;
	const opts: SignInButtonOptions | LinkAccountButtonOptions = options.opts;
	if (!code || !referer || !opts) throw error(400, `invalid request: ${JSON.stringify({ code, referer, opts })}`);

	const atParams = new URLSearchParams({
		client_id: PUBLIC_GITHUB_CLIENT_ID,
		client_secret: GITHUB_CLIENT_SECRET,
		code,
	});

	const atResponse = await fetch(`https://github.com/login/oauth/access_token?${atParams}`, {
		method: "POST",
		headers: {
			Accept: "application/json",
		},
	}).then((res) => res.json());

	const { access_token } = atResponse;

	const res = await fetch("https://api.github.com/user", { headers: { Authorization: `token ${access_token}` } }).then((res) => res.json());

	if ("rememberMe" in opts) {
		return loginWithExternalIdentity({
			idFieldName: "githubID",
			idValue: res.id.toString(),
			rememberMe: opts.rememberMe,
			profileData: {
				email: res.email,
				name: res.name,
				picture: res.avatar_url,
			},
			redirect: referer,
		});
	} else {
		if (userID && (await authenticate({ sessionID: sessionID, userID: userID }))) {
			linkAccount({ idFieldName: "githubID", idValue: res.id.toString(), userID: userID });
			throw redirect(303, referer);
		} else {
			throw error(400, `couldn't authenticate ${JSON.stringify({ sessionID: sessionID, userID: userID })}`);
		}
	}
};
