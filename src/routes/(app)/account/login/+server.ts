import { SESSION_MAXAGE_HOURS } from "$env/static/private";
import { LoginParameters } from "$lib/types";
import { getDecoder, log } from "$lib/util";
import { error, redirect, type RequestHandler } from "@sveltejs/kit";
import type cookie from "cookie";
import { getTrustedIdentity } from "../lib";
import { loginOrCreateAccount } from "./lib";

export const GET: RequestHandler = async ({ url, locals: { state }, cookies }) => {
	const options = getDecoder(LoginParameters).parse(url.searchParams.get("state"));
	log(url.pathname, { state, options });
	if (!state || options.stateToken !== state) throw error(400, "invalid state");

	const { i: trustedIdentity, getACD } = await getTrustedIdentity(url, options.method);
	const { userID, newSessionToken } = await loginOrCreateAccount(trustedIdentity, getACD);

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
