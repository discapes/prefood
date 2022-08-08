import ddb from '$lib/ddb.js';
import type { RequestHandler } from './__types';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

export const GET: RequestHandler = async () => {
	const command = new ScanCommand({ TableName: 'restaurants' });
	const res = await ddb.send(command);
	if (!res || !res.Items) throw new Error(`Internal error: restaurants not found`);
	return {
		body: {
			restaurants: res.Items
		}
	};
};
