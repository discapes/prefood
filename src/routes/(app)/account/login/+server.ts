import { SESSION_MAXAGE_HOURS } from "$env/static/private";
import { COOKIES, URLS } from "$lib/addresses";
import { UserAuth } from "$lib/server/services/Account";
import AccountService from "$lib/server/services/AccountService";
import { LinkParameters, LoginParameters, StateParameters } from "$lib/types/misc";
import { getDecoder, log } from "$lib/util";
import { error, redirect, type Cookies, type RequestHandler } from "@sveltejs/kit";
import type cookie from "cookie";
import { verifyIdentity } from "../common";

async function linkHandler(url: URL, options: LinkParameters, cookies: Cookies): Promise<Response> {
	const { i } = await verifyIdentity(url, options.method);

	if (await AccountService.existsTI(i)) throw error(400, "Method already linked");
	await AccountService.setAttribute(UserAuth.parse(locals), {
		key: i.methodName,
		value: i.methodValue,
	});

	cookies.delete("state");
	throw redirect(300, URLS.ACCOUNT);
}

export const GET: RequestHandler = async ({ url, cookies }) => {
	const options = getDecoder(StateParameters).parse(url.searchParams.get("state"));
	if (options.stateToken !== cookies.get(COOKIES.STATETOKEN)) throw error(400, "Invalid state token!");
	switch (options.type) {
		case "link":
			return await linkHandler(url, options, cookies);
		case "login":
			return await loginHandler(url, options, cookies);
		default:
			throw error(500, "Something went wrong");
	}
};

async function loginHandler(url: URL, options: LoginParameters, cookies: Cookies): Promise<Response> {
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
	throw redirect(301, new URL(options.referer, url).href);
}
