import { SESSION_MAXAGE_HOURS } from "$env/static/private";
import { LoginParameters } from "$lib/types";
import { getDecoder, log } from "$lib/util";
import { error, type RequestHandler } from "@sveltejs/kit";
import cookie from "cookie";
import { getTrustedIdentity } from "../lib";
import { loginOrCreateAccount } from "./lib";

export const GET: RequestHandler = async ({ url, locals: { state } }) => {
	const options = getDecoder(LoginParameters).parse(url.searchParams.get("state"));
	log(url.pathname, { state, options });
	if (!state || options.stateToken !== state) throw error(400, "invalid state");

	const { i: trustedIdentity, getACD } = await getTrustedIdentity(url, options.method);
	const { userID, newSessionToken } = await loginOrCreateAccount(trustedIdentity, getACD);

	const cookieOpts: cookie.CookieSerializeOptions = {
		maxAge: options.rememberMe ? +SESSION_MAXAGE_HOURS * 60 * 60 : undefined,
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secure: true,
	};

	const headers = new Headers({
		location: new URL(options.referer, url).href,
	});
	headers.append("set-cookie", cookie.serialize("userID", userID, cookieOpts));
	headers.append("set-cookie", cookie.serialize("sessionToken", newSessionToken, cookieOpts));
	headers.append("set-cookie", cookie.serialize("state", "", { maxAge: 0 }));
	log(url.pathname, "success, setting cookies");

	return new Response(null, {
		status: 303,
		headers,
	});
};
