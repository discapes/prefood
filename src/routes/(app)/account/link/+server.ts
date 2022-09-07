import { URLS } from "$lib/addresses";
import { IdentificationMethod, LinkParameters } from "$lib/types";
import { getDecoder } from "$lib/util";
import { error, redirect, type RequestHandler } from "@sveltejs/kit";
import cookie from "cookie";
import { z } from "zod";
import { getTrustedIdentity } from "../lib";
import { linkExternalAccount } from "./lib";

// we don't need to verify state because this requires login details already
export const GET: RequestHandler = async ({ url, locals: { sessionToken, userID, state }, cookies }) => {
	const options = getDecoder(LinkParameters).parse(url.searchParams.get("state"));
	if (!state || options.stateToken !== state) throw error(400, "invalid state");
	const { i } = await getTrustedIdentity(url, options.method);

	await linkExternalAccount({
		idFieldName: i.methodName,
		idValue: i.methodValue,
		userID: z.string().parse(userID),
		sessionToken: z.string().parse(sessionToken),
	});

	cookies.delete("state");
	throw redirect(300, URLS.ACCOUNT);
};
