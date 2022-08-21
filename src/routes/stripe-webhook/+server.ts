import { getSecretStripe } from "$lib/stripe";
import type Stripe from "stripe";
import type { RequestHandler } from "./$types";
import ddb, { putItem } from "$lib/ddb";
import type { Order, SessionMetadata } from "src/types/types";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { error } from "@sveltejs/kit";

const endpointSecret = "whsec_7875c134218714a9d36bb383f34e1e0ac2fb5199d8d8cbabc1a757b8098fbf26";
const stripe = getSecretStripe();

function toBuffer(ab: ArrayBuffer): Buffer {
	const buf = Buffer.alloc(ab.byteLength);
	const view = new Uint8Array(ab);
	for (let i = 0; i < buf.length; i++) {
		buf[i] = view[i];
	}
	return buf;
}

export const POST: RequestHandler = async ({ request }) => {
	const sig = request.headers.get("stripe-signature");

	const _rawBody = await request.arrayBuffer();
	const payload = toBuffer(_rawBody);
	const event = stripe.webhooks.constructEvent(payload, sig!, endpointSecret);

	switch (event.type) {
		case "checkout.session.completed": {
			const session = event.data.object as Stripe.Checkout.Session;
			if (session.payment_status === "paid") {
				await fulfillOrder(session);
			}
			break;
		}
		case "checkout.session.async_payment_succeeded": {
			const session = event.data.object as Stripe.Checkout.Session;
			fulfillOrder(session);
			break;
		}
		default:
			console.log(`Unhandled event type ${event.type}`);
	}
	/*
		TODO
		elsewhere: set the webhook to here
		elsewhere: metadata should include { userID, restaurantID and needToSetCustomerID }

		create a new order with line items, userID and restaurantID 
		set customer id for userID if needToSetCustomerID
		far future: trigger web push notification for subscribers
	 */
	return new Response();
};

async function fulfillOrder(session: Stripe.Checkout.Session) {
	const metadata: SessionMetadata = <SessionMetadata>session.metadata;
	const line_items = await (await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items"] })).line_items?.data;
	if (!line_items) throw error(500, `couldn't retrieve session`);

	const order: Order = {
		restaurantName: metadata.restaurantName,
		userID: metadata.userID,
		items: line_items,
		timestamp: Date.now(),
	};

	await putItem("orders", order);
	if (!metadata.linkedCID) {
		console.log(`Linking customer ID ${session.customer} to userID ${metadata.userID}`);
		const cmd = new UpdateCommand({
			TableName: "users",
			Key: { userID: metadata.userID },
			UpdateExpression: `SET stripeCustomerID = :stripeCustomerID`,
			ExpressionAttributeValues: {
				":stripeCustomerID": session.customer,
			},
		});
		await ddb.send(cmd);
	}
}
