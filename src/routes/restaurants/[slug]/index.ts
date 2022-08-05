import sql from '$lib/database.js';
import type { RequestHandler } from './__types';

export const GET: RequestHandler = async ({ params }) => {
	const menu =
		await sql`SELECT name, price_cents FROM menuitems WHERE restaurant_id = (SELECT id FROM restaurants WHERE slug=${params.slug})`;
	if (!menu.count)
		return {
			status: 404,
			body: new Error(`Restaurant ${params.slug} not found.`)
		};
	return {
		body: {
			menu
		}
	};
};
