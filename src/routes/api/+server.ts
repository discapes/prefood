import { negotiate } from "$lib/api";
import type { RequestHandler } from "@sveltejs/kit";

function getMessage() {
	return "hello world";
}

/**
 * @openapi
 * /:
 *  get:
 *    summary: test endpoint
 *    responses:
 *      200:
 *        description: hello world message
 *        content:
 *          text/plain:
 *            schema:
 *              $ref: '#/components/schemas/HelloWorld'
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/HelloWorld'
 * components:
 *  schemas:
 *    HelloWorld:
 *      type: string
 *      example: hello world
 */

export const GET: RequestHandler = async ({ request: { headers } }) => {
	const handlers: Record<string, () => Promise<Response>> = {
		async "application/json"() {
			return new Response(JSON.stringify(getMessage()));
		},
		async "text/plain"() {
			return new Response(getMessage());
		},
	};
	return await negotiate(handlers, headers.get("Accept"));
};
