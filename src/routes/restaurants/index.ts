import ddb from '$lib/ddb.js';
import type { RequestHandler } from './__types';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const GET: RequestHandler = async () => {
	const command = new ScanCommand({ TableName: 'restaurants' });
	const res = await ddb.send(command);
	return {
		body: {
			restaurants: res.Items?.map((i) => unmarshall(i))
		}
	};
};
