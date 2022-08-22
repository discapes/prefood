import ddb from "$lib/ddb.js";
import { getDataFromOrderSlug } from "$lib/util";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { error } from "@sveltejs/kit";
import type { Order } from "src/types/types";
import type { PageServerLoad } from "./$types";

export const prerender = false;

export const load: PageServerLoad = async ({ params }) => {
	const { userID, timestamp } = getDataFromOrderSlug(params.slug);
	if (!userID || !timestamp) throw error(400, `invalid slug: userID ${userID} timestamp ${timestamp}`);

	const order = await getOrder({ userID, timestamp });
	if (!order) throw error(404, `Order ${params.slug} not found.`);

	return {
		order,
	};
};

async function getOrder({ userID, timestamp }: { userID: string; timestamp: number }) {
	const cmd = new QueryCommand({
		TableName: "orders",
		KeyConditionExpression: `userID = :userID and #timestamp = :timestamp`,
		ExpressionAttributeValues: {
			":userID": userID,
			":timestamp": timestamp,
		},
		ExpressionAttributeNames: {
			"#timestamp": "timestamp",
		},
	});
	const res = await ddb.send(cmd);
	return <Order | undefined>res.Items?.[0];
}
