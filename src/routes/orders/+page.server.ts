import { getUserData } from "src/routes/account/common";
import ddb from "$lib/ddb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { error } from "@sveltejs/kit";
import type { Order, User } from "../../types/types";
import type { PageServerLoad } from "./$types";

export const prerender = false;

export const load: PageServerLoad = async ({ locals: { userID, sessionToken } }) => {
	if (userID) {
		let orderDataPromise = getOrdersForUser(userID);
		const userData = await getUserData({ sessionToken, userID });

		if (userData) {
			const orderData = await orderDataPromise;
			if (!orderData) throw error(500, `couldn't find order data from ${userID}`);
			return {
				userData: <User>userData,
				orders: orderData,
			};
		}
	}

	async function getOrdersForUser(userID: string) {
		const cmd = new QueryCommand({
			TableName: "orders",
			KeyConditionExpression: `userID = :userID`,
			ExpressionAttributeValues: {
				":userID": userID,
			},
			ScanIndexForward: false,
		});
		const res = await ddb.send(cmd);
		return <Order[] | undefined>res.Items;
	}
};
