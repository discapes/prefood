import type { RequestHandler } from '@sveltejs/kit';
import { putItem, deleteItem } from '$lib/ddb';

export const POST: RequestHandler = async ({ request: req }) => {
	const json = await req.json();

	switch (json.action) {
		case 'set':
			await putItem('restaurants', json.restaurant);
			break;
		case 'delete':
			await deleteItem('restaurants', { name: json.name });
			break;
	}

	return {
		status: 200
	};
};
