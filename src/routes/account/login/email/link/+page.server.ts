import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
export const prerender = false;
import * as cookie from "cookie";
import { SESSION_MAXAGE_HOURS } from "$env/static/private";
import { falsePropNames, log } from "$lib/util";

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	log("email callback requested");
	const { referer, userID, sessionID, email, rememberMe } = Object.fromEntries(url.searchParams.entries());
	const fpn = falsePropNames({ referer });
	if (fpn.length) throw error(400, `invalid request: ${fpn} are undefined`);
	else log({ referer, userID, sessionID, email });

	if (email) {
		return {
			text: "<form for creating account>",
		};
	} else {
		const cookieOpts: cookie.CookieSerializeOptions = {
			maxAge: rememberMe ? +SESSION_MAXAGE_HOURS * 60 * 60 : undefined,
			path: "/",
		};

		setHeaders({
			"set-cookie": [cookie.serialize("userID", userID, cookieOpts), cookie.serialize("sessionID", sessionID, cookieOpts)],
		});

		throw redirect(303, referer);
	}
};
