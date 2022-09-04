import { URLS } from "$lib/addresses";
import { IdentificationMethod } from "$lib/types";
import { getDecoder } from "$lib/util";
import { error, type RequestHandler } from "@sveltejs/kit";
import cookie from "cookie";
import { z } from "zod";
import { getTrustedIdentity } from "../lib";
import { linkExternalAccount } from "./lib";

export const LinkParameters = z.object({
	method: IdentificationMethod,
	stateToken: z.string(),
});
export type LinkParameters = z.infer<typeof LinkParameters>;

// we don't need to verify state because this requires login details already
export const GET: RequestHandler = async ({ url, locals: { sessionToken, userID, state } }) => {
	const options = getDecoder(LinkParameters).parse(url.searchParams.get("state"));
	if (!state || options.stateToken !== state) throw error(400, "invalid state");
	const { i } = await getTrustedIdentity(url, options.method);

	await linkExternalAccount({
		idFieldName: i.methodName,
		idValue: i.methodValue,
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
