import type { RequestEvent, RequestHandler } from "./$types";
import { jsonResponse } from "$lib/api";
import { assertNever, Get, Request, Route, Security, Tags } from "tsoa";
import { error } from "@sveltejs/kit";
import AccountService from "$lib/services/AccountService";
import { Auth, type Account } from "$lib/services/Account";
import { assert } from "$lib/util";

type PartialAccount = Partial<Omit<Account, "sessionTokens">>;

@Route("account")
@Tags("account")
@Security("oauth")
export class F {
	@Get()
	static async GET(@Request() e: RequestEvent): Promise<PartialAccount> {
		try {
			const ud = await AccountService.fetchScopedData(Auth.parse(e.locals));
			assert(ud);
			return ud;
		} catch (e) {
			throw error(403, "invalid auth");
		}
	}
}

export const GET: RequestHandler = (e) =>
	F.GET(e).then((r) => jsonResponse(r, e.request.headers));
