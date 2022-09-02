import { URLS } from "$lib/addresses";
import { IdentificationKeyName } from "$lib/types";
import { getDecoder } from "$lib/util";
import { error, type RequestHandler } from "@sveltejs/kit";
import cookie from "cookie";
import { z } from "zod";
import { getIdentityFromURL } from "../lib";
import { linkExternalAccount } from "./lib";

export const PassedLinkState = z.object({
	method: IdentificationKeyName,
	state: z.string(),
});
export type PassedLinkState = z.infer<typeof PassedLinkState>;

// we don't need to verify state because this requires login details already
export const GET: RequestHandler = async ({ url, locals: { sessionToken, userID, state } }) => {
	const options = getDecoder(PassedLinkState).parse(url.searchParams.get("state"));
	if (options.state !== state) throw error(400, "invalid state");
	const identity = await getIdentityFromURL(url, options.method);

	await linkExternalAccount({
		idFieldName: identity.methodName,
		idValue: identity.methodValue,
		userID: z.string().parse(userID),
		sessionToken: z.string().parse(sessionToken),
	});

	return new Response(null, {
		status: 300,
		headers: new Headers({
			location: URLS.ACCOUNT,
			"set-cookie": cookie.serialize("state", "", { maxAge: 0 }),
		}),
	});
};
