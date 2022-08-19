import { authenticate } from "$lib/authentication";
import ddb from "$lib/ddb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { error } from "@sveltejs/kit";
import type { Order, Typify, User } from "src/types/types";
import type { PageServerLoad } from "./$types";

const ORDERS_USERID_KEY = "personID";
export const prerender = false;

export const load: PageServerLoad = async ({ locals: { userID, sessionID } }) => {
	if (userID) {
		let orderDataPromise = getOrderData(userID);
		const userData = await authenticate({ sessionID, userID });

		if (userData) {
			const orderData = await orderDataPromise;
			if (!orderData) throw error(500, `couldn't find order data from ${userID}`);
			return {
				userData: <Typify<User>>userData,
				orders: orderData,
			};
		}
	}

	async function getOrderData(userID: string) {
		const cmd = new QueryCommand({
			TableName: "orders",
			KeyConditionExpression: `${ORDERS_USERID_KEY} = :userID`,
			ExpressionAttributeValues: {
				":userID": userID,
			},
		});
		const res = await ddb.send(cmd);
		return <Order[]>res.Items;
	}
};
