import { URLS } from "$lib/addresses";
import AccountService from "$lib/services/AccountService";
import { LinkParameters } from "$lib/types";
import { getDecoder } from "$lib/util";
import { error, redirect, type RequestHandler } from "@sveltejs/kit";
import { z } from "zod";
import { verifyIdentity } from "../common";

// we don't need to verify state because this requires login details already
export const GET: RequestHandler = async ({
	url,
	locals: { sessionToken, userID, state },
	cookies,
}) => {
	const options = getDecoder(LinkParameters).parse(url.searchParams.get("state"));
	if (!state || options.stateToken !== state) throw error(400, "invalid state");
	const { i } = await verifyIdentity(url, options.method);

	if (await AccountService.existsTI(i)) throw error(400, "Method álready linked");
	await AccountService.setAttribute({
		attribute: i.methodName,
		value: i.methodValue,
		userID: z.string().parse(userID),
		sessionToken: z.string().parse(sessionToken),
	});

	cookies.delete("state");
	throw redirect(300, URLS.ACCOUNT);
};
