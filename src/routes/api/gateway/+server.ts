import { AWS_ACCESS_ID, AWS_ACCESS_KEY_MY, AWS_REGION_MY } from "$env/static/private";
import { PUBLIC_GATEWAY_ENDPOINT } from "$env/static/public";
import { ApiGatewayManagementApiClient, GetConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import type { RequestHandler } from "./$types";

const client = new ApiGatewayManagementApiClient({
	region: AWS_REGION_MY,
	endpoint: "https://" + PUBLIC_GATEWAY_ENDPOINT,
	credentials: {
		accessKeyId: AWS_ACCESS_ID,
		secretAccessKey: AWS_ACCESS_KEY_MY,
	},
});

export const POST: RequestHandler = async ({ request }) => {
	const { connectionId, header, query, type } = await request.json();

	console.log({ connectionId, header, query, type });

	return new Response();
};

async function getInfo(connectionId: string) {
	const res = await client.send(
		new GetConnectionCommand({
			ConnectionId: connectionId,
		})
	);
	console.log(res);
	return res;
}
