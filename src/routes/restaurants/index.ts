import sql from '$lib/database.js';
import type { RequestHandler } from './__types';

export const GET: RequestHandler = async () => {
	const restaurants = await sql`SELECT name, slug FROM restaurants`;
	return {
		body: {
			restaurants
		}
	};
};
