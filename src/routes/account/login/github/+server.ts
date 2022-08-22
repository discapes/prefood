import { GITHUB_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_GITHUB_CLIENT_ID } from "$env/static/public";
import { linkExternalAccount, loginWithExternalIdentity } from "$lib/authentication";
import { falsePropNames, log } from "$lib/util";
import { error, redirect } from "@sveltejs/kit";
import type { LinkAccountButtonOptions, SignInButtonOptions } from "src/types/types";
import type { RequestHandler } from "./$types";

export const prerender = false;

async function getProfileFromGithubCallback(url: URL) {
	const code = <string>url.searchParams.get("code");

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

	return {
		email: res.email,
		name: res.name,
		picture: res.avatar_url,
		githubID: res.id.toString(),
	};
}

export const GET: RequestHandler = async ({ url, locals: { userID, sessionID } }) => {
	log("github callback requested");
	type FWDData = SignInButtonOptions | LinkAccountButtonOptions;

	const { email, picture, name, githubID } = await getProfileFromGithubCallback(url);
	const { referer, opts: forwardedData }: { opts: FWDData; referer: string } = JSON.parse(<string>url.searchParams.get("options"));
	const fpn = falsePropNames({ githubID, email, name, picture, forwardedData, referer });
	if (fpn.length) throw error(400, `invalid request: ${fpn} are undefined`);
	else log({ githubID, email, name, picture, forwardedData, referer });

	if ("rememberMe" in forwardedData) {
		return loginWithExternalIdentity({
			idFieldName: "githubID",
			idValue: githubID,
			rememberMe: forwardedData.rememberMe,
			profileData: {
				email,
				name,
				picture,
			},
			redirect: referer,
		});
	} else {
		if (userID && sessionID) {
			await linkExternalAccount({ idFieldName: "githubID", idValue: githubID, userID, sessionID });
			throw redirect(303, referer);
		} else {
			throw error(500, `userID or sessionID is undefined: ${JSON.stringify({ sessionID: sessionID, userID: userID })}`);
		}
	}
};
