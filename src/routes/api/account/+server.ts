import { jsonResponse } from "$lib/server/api";
import { OAuth } from "$lib/server/services/Account";
import AccountService from "$lib/server/services/AccountService";
import type { Account } from "$lib/types/Account";
import { assert } from "$lib/util";
import { error } from "@sveltejs/kit";
import { Get, Request, Route, Security, Tags } from "tsoa";
import type { RequestEvent, RequestHandler } from "./$types";

@Route("account")
@Tags("account")
@Security("oauth")
export class F {
	@Get()
	static async GET(@Request() e: RequestEvent): Promise<Partial<Account>> {
		try {
			const auth = OAuth.parse(e.request.headers.get("Authorization"));
			const ud = await AccountService.fetchScopedData(auth);
			assert(ud);
			return ud;
		} catch (e) {
			throw error(403, "invalid auth");
		}
	}
}

export const GET: RequestHandler = (e) => F.GET(e).then((r) => jsonResponse(r, e.request.headers));
