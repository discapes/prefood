import { getSecretStripe } from "$lib/stripe";
import type Stripe from "stripe";
import type { RequestHandler } from "./$types";
import ddb, { putItem } from "$lib/ddb";
import type { Order, SessionMetadata } from "src/types/types";

const endpointSecret = "whsec_7875c134218714a9d36bb383f34e1e0ac2fb5199d8d8cbabc1a757b8098fbf26";

function toBuffer(ab: ArrayBuffer): Buffer {
	const buf = Buffer.alloc(ab.byteLength);
	const view = new Uint8Array(ab);
	for (let i = 0; i < buf.length; i++) {
		buf[i] = view[i];
	}
	return buf;
}

export const POST: RequestHandler = async ({ request }) => {
	const stripe = getSecretStripe();
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
	const order: Order = {
		restaurantName: metadata.restaurantName,
		userID: metadata.userID,
		items: JSON.parse(metadata.itemsJSON),
		timestamp: Date.now(),
	};
	await putItem("orders", order);
}
