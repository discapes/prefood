import { negotiate } from "$lib/api";
import type { RequestHandler } from "@sveltejs/kit";
import { Example, Get, Produces, Route } from "tsoa";

@Route("/")
class HelloController {
	/**
	 * @summary Test the API
	 */
	@Produces("application/json")
	@Produces("text/plain")
	@Example("hello world")
	@Get()
	static async getMessage() {
		debugger;
		return "hello world";
	}
}

export const GET: RequestHandler = async ({ request: { headers } }) => {
	const handlers: Record<string, () => Promise<Response>> = {
		async "application/json"() {
			return new Response(JSON.stringify(await HelloController.getMessage()));
		},
		async "text/plain"() {
			return new Response(await HelloController.getMessage());
		},
	};
	return await negotiate(handlers, headers.get("Accept"));
};
