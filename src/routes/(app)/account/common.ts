import type { AccountCreationData, TrustedIdentity } from "$lib/types";
import { error } from "@sveltejs/kit";
import { verifyEmailIdentity } from "./email";
import { verifyGithubIdentity } from "./github";
import { verifyGoogleIdentity } from "./google";

export async function verifyIdentity(
	url: URL,
	method: string
): Promise<{ i: TrustedIdentity; getACD: () => Promise<AccountCreationData> }> {
	switch (method) {
		case "githubID":
			return verifyGithubIdentity(url);
		case "googleID":
			return verifyGoogleIdentity(url);
		case "email":
			return verifyEmailIdentity(url);
		default:
			throw error(400, "invalid method");
	}
}
