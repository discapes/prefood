import { GITHUB_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_GITHUB_CLIENT_ID } from "$env/static/public";
import { loginWithExternalIdentity } from "$lib/authentication";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const prerender = false;

export const GET: RequestHandler = async ({ url }) => {
	const requestParams = new URL(url).searchParams;
	const code = <string>requestParams.get("code");

	const options = JSON.parse(<string>requestParams.get("options"));
	const referer: string = options.referer;
	const rememberMe: boolean = options.rememberMe;
	if (!code || !referer || rememberMe == undefined) throw error(400, `invalid request: ${JSON.stringify({ code, referer, rememberMe })}`);

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

	return loginWithExternalIdentity({
		idFieldName: "githubID",
		idValue: res.id.toString(),
		rememberMe: rememberMe,
		profileData: {
			email: res.email,
			name: res.name,
			picture: res.avatar_url,
		},
		redirect: referer,
	});
};
