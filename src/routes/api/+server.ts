import { negotiate } from "$lib/api";
import type { RequestHandler } from "@sveltejs/kit";

function getMessage() {
	return "hello world";
}

export const GET: RequestHandler = async ({ request: { headers } }) => {
	const handlers: Record<string, () => Response> = {
		"application/json"() {
			return new Response(JSON.stringify(getMessage()));
		},
		"text/plain"() {
			return new Response(getMessage());
		},
	};
	return negotiate(handlers, headers.get("Accept"), "application/json");
};
