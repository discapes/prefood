import { getItem } from '$lib/ddb.js';
import type { Restaurant } from 'src/types/types';
import type { RequestHandler } from './__types';

export const GET: RequestHandler = async ({ params }) => {
	const res = <Restaurant | undefined>await getItem('restaurants', { name: params.slug });

	if (!res)
		return {
			status: 404,
			body: new Error(`Restaurant ${params.slug} not found.`)
		};

	return {
		body: {
			restaurant: res
		}
	};
};
