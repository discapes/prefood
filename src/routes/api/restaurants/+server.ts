import { negotiate } from "$lib/api";
import { Table } from "$lib/server/ddb";
import type { Restaurant } from "$lib/types";
import type { RequestHandler } from "@sveltejs/kit";

/**
 * @openapi
 * /restaurants:
 *  get:
 *    description: get restaurant data
 *    responses:
 *      200:
 *        description: restaurant found
 *        content:
 *          application/json:
 *            schema:
 *              name: Restaurant
 *
 *      404:
 *        description: restaurant not found
 *
 */

export const GET: RequestHandler = async ({ request: { headers } }) => {
	const handlers = {
		async "application/json"(): Promise<Response> {
			const r = new Table<Restaurant>("restaurants").scan();
			return new Response(JSON.stringify(r));
		},
	};
	return await negotiate(handlers, headers.get("accept"));
};
