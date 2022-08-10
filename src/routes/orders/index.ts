import { authenticate } from '$lib/authentication';
import ddb from '$lib/ddb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { RequestHandler } from '@sveltejs/kit';
import type { Typify, User } from 'src/types/types';

const ORDERS_USERID_KEY = 'personID';

export const GET: RequestHandler = async ({ locals: { userID, sessionID } }) => {
	let orderDataPromise;
	if (userID) orderDataPromise = getOrderData(userID);
	const userData = await authenticate({ sessionID, userID });

	if (!userData) {
		return {
			body: {
				userData: undefined
			}
		};
	} else {
		const orderData = await orderDataPromise;
		if (!orderData) throw new Error(`Internal error: couldn't find order data from ${userID}`);
		return {
			body: {
				userData: <Typify<User>>userData,
				orders: orderData
			}
		};
	}

	async function getOrderData(userID: string) {
		const cmd = new QueryCommand({
			TableName: 'orders',
			KeyConditionExpression: `${ORDERS_USERID_KEY} = :userID`,
			ExpressionAttributeValues: {
				':userID': userID
			}
		});
		const res = await ddb.send(cmd);
		return <Order[]>res.Items;
	}
};
