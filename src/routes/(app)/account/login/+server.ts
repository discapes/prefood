import { SESSION_MAXAGE_HOURS } from "$env/static/private";
import AccountService from "$lib/services/AccountService";
import { LoginParameters } from "$lib/types";
import { getDecoder, log } from "$lib/util";
import { error, redirect, type RequestHandler } from "@sveltejs/kit";
import type cookie from "cookie";
import { verifyIdentity } from "../common";

export const GET: RequestHandler = async ({ url, locals: { state }, cookies }) => {
	const options = getDecoder(LoginParameters).parse(url.searchParams.get("state"));
	log(url.pathname, { state, options });
	if (!state || options.stateToken !== state) throw error(400, "invalid state");

	const { i, getACD } = await verifyIdentity(url, options.method);
	let userID = await AccountService.fetchUIDForTI(i);
	let newSessionToken: string;
	if (userID) {
		newSessionToken = await AccountService.addSessionToken({ userID });
	} else {
		const acd = await getACD();
		({ userID, initialSessionToken: newSessionToken } = await AccountService.create(acd));
	}

	const cookieOpts: cookie.CookieSerializeOptions = {
		// secure and httponly are default
		maxAge: options.rememberMe ? +SESSION_MAXAGE_HOURS * 60 * 60 : undefined,
		path: "/",
		sameSite: "lax",
	};

	cookies.set("userID", userID, cookieOpts);
	cookies.set("sessionToken", newSessionToken, cookieOpts);
	cookies.delete("state");
	log(url.pathname, "success, set cookies");
	throw redirect(300, new URL(options.referer, url).href);
};
