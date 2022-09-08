import { GITHUB_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_GITHUB_CLIENT_ID } from "$env/static/public";
import { AccountCreationData, TrustedIdentity } from "$lib/types";
import { error } from "@sveltejs/kit";
import { z } from "zod";
import { log } from "$lib/util";

export async function verifyGithubIdentity(
	url: URL
): Promise<{ i: TrustedIdentity; getACD: () => Promise<AccountCreationData> }> {
	const code = url.searchParams.get("code");
	log("verifySenderGithub", { code });
	if (typeof code !== "string") throw error(400, "code is undefined");

	const atParams = new URLSearchParams({
		client_id: PUBLIC_GITHUB_CLIENT_ID,
		client_secret: GITHUB_CLIENT_SECRET,
		code,
	});

	const { access_token } = await fetch(
		`https://github.com/login/oauth/access_token?${atParams}`,
		{
			method: "POST",
			headers: {
				Accept: "application/json",
			},
		}
	).then((res) => res.json());

	console.log(`got access token ${access_token}, getting profile info`);

	const castToString = z.preprocess((val) => String(val), z.string());
	const acd = await fetch("https://api.github.com/user", {
		headers: { Authorization: `token ${access_token}` },
	})
		.then((res) => res.json())
		.then((o) =>
			AccountCreationData.parse({
				email: o?.email,
				name: o?.name,
				picture: o?.avatar_url,
				methodName: "githubID",
				methodValue: castToString.parse(o?.id),
			})
		);

	return {
		i: acd,
		getACD: async () => acd,
	};
}
