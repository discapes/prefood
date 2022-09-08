import type { RequestEvent, RequestHandler } from "./$types";
import { jsonResponse } from "$lib/api";
import { Get, Request, Route, Security, Tags } from "tsoa";
import { error } from "@sveltejs/kit";
import AccountService from "$lib/services/AccountService";
import { Auth, type Account } from "$lib/services/Account";

@Route("account")
@Tags("account")
@Security("oauth")
export class F {
	@Get()
	static async GET(@Request() e: RequestEvent): Promise<Partial<Account>> {
		const ud = await AccountService.fetchScopedData(Auth.parse(e.locals));
		if (!ud) throw error(403, "invalid auth");
		return ud;
	}
}

export const GET: RequestHandler = (e) =>
	F.GET(e).then((r) => jsonResponse(r, e.request.headers));
