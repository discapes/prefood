import type { RequestHandler } from "./$types";
import { ApiGatewayManagementApiClient, GetConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { AWS_ACCESS_ID, AWS_ACCESS_KEY, AWS_REGION } from "$env/static/private";

const client = new ApiGatewayManagementApiClient({
	region: AWS_REGION,
	endpoint: "https://ia1rfsectb.execute-api.eu-north-1.amazonaws.com/test",
	credentials: {
		accessKeyId: AWS_ACCESS_ID,
		secretAccessKey: AWS_ACCESS_KEY,
	},
});

export const POST: RequestHandler = async ({ request }) => {
	// const { connectionId, header, query, type } = await request.json();

	console.log(await request.text());
	// setTimeout(async () => {
	// 	const res = await client.send(
	// 		new GetConnectionCommand({
	// 			ConnectionId: connectionId,
	// 		})
	// 	);
	// 	console.log(res);
	// }, 1000);

	return new Response();
};
