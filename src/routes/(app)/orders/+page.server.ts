import { getUserData } from "$lib/server/auth";
import { ddb } from "$lib/server/ddb";
import type { Order, User } from "$lib/types";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { userID, sessionToken }, parent }) => {
	if (userID) {
		let orderDataPromise = getOrdersForUser(userID);
		const { userData } = await parent();

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
