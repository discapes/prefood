import { getItem } from '$lib/ddb.js';
import type { RequestHandler } from './__types';
export const GET: RequestHandler = async ({ params }) => {
	const res = await getItem('restaurants', { slug: params.slug });

	if (!res)
		return {
			status: 404,
			body: new Error(`Restaurant ${params.slug} not found.`)
		};
	return {
		body: res
	};
};
