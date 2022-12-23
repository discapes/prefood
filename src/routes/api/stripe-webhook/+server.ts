import { MAIL_FROM_DOMAIN } from "$env/static/private";
import { ddb, Table } from "$lib/server/ddb";
import { sendMail } from "$lib/server/mail";
import { getSecretStripe } from "$lib/server/stripe";
import type { Order } from "$lib/types/Order";
import type { SessionMetadata } from "$lib/types/misc";
import { getSlugFromOrder } from "$lib/util";
import type { RequestHandler } from "./$types";
import type Stripe from "stripe";
import { STRIPE_ENDPOINT_SECRET } from "$env/static/private";
import { uuid } from "$lib/util";
import { error } from "@sveltejs/kit";

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
	try {
		const sig = request.headers.get("stripe-signature");

		const _rawBody = await request.arrayBuffer();
		const payload = toBuffer(_rawBody);
		const event = stripe.webhooks.constructEvent(payload, sig!, STRIPE_ENDPOINT_SECRET);

		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				if (session.payment_status === "paid") {
					await fulfillOrder(session, request.url);
				}
				break;
			}
			case "checkout.session.async_payment_succeeded": {
				const session = event.data.object as Stripe.Checkout.Session;
				await fulfillOrder(session, request.url);
				break;
			}
			default:
				console.log(`Unhandled event type ${event.type}`);
		}

		return new Response();
	} catch (e) {
		console.error(e);
		throw e;
	}
};

async function fulfillOrder(session: Stripe.Checkout.Session, url: string) {
	console.log(`Fulfilling order`);
	const metadata: SessionMetadata = <SessionMetadata>session.metadata;
	const operations = [];

	if (metadata.userID && !metadata.linkedCID) {
		operations.push(linkCID(metadata.userID, session.customer as string));
	}

	const expanded = await stripe.checkout.sessions.retrieve(session.id, {
		expand: ["line_items"],
	});
	const line_items = expanded.line_items?.data;
	if (!line_items) throw error(500, `couldn't retrieve session`);

	const order: Order = {
		restaurantName: metadata.restaurantName,
		userID: metadata.userID || uuid(),
		items: line_items,
		timestamp: Date.now(),
	};

	console.log(`Creating order for ${metadata.restaurantName}`);
	operations.push(new Table("orders").putItem(order));
	operations.push(sendReceipt(session.customer_details?.email, order, url));

	await Promise.all(operations);
}

async function sendReceipt(recipient: string | null | undefined, order: Order, url: string) {
	sendMail({
		from: `"${order.restaurantName}" <no-reply@${MAIL_FROM_DOMAIN}>`, // sender address
		to: <string>recipient, // list of receivers
		subject: "Receipt for " + order.restaurantName, // Subject line
		text: `You can view the order at ${new URL("/orders/" + getSlugFromOrder(order), url).href}

Restaurant: ${order.restaurantName}

Date: ${new Date(order.timestamp).toLocaleTimeString()} on ${new Date(order.timestamp).toLocaleDateString()}
	
Items:
${order.items.map((item) => `${item.quantity}x ${item.description} - ${(item.amount_total / 100).toFixed(2).replace(".", ",")} €`).join("\n")}`, // plain text body
		// html: "<b>Hello world?</b>", // html body
	});
}

async function linkCID(userID: string, stripeCustomerID: string) {
	console.log(`Linking customer ID ${stripeCustomerID} to userID ${userID}`);
	await new Table("users")
		.key("userID")
		.set(ddb`stripeCustomerID = :${stripeCustomerID}`)
		.updateItem(userID);
}
