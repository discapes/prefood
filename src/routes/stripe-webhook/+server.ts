import { getSecretStripe } from "$lib/stripe";
import type Stripe from "stripe";
import type { RequestHandler } from "./$types";
import ddb, { putItem } from "$lib/ddb";
import type { Order, SessionMetadata } from "../../types/types";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { error } from "@sveltejs/kit";
import { MAIL_FROM_DOMAIN } from "$env/static/private";
import { getSlugFromOrder } from "$lib/util";
import { v4 as uuidv4 } from "uuid";
import { sendMail } from "$lib/mail";

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
	try {
		const sig = request.headers.get("stripe-signature");

		const _rawBody = await request.arrayBuffer();
		const payload = toBuffer(_rawBody);
		const event = stripe.webhooks.constructEvent(payload, sig!, endpointSecret);

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
	let operations = [];

	if (metadata.userID && !metadata.linkedCID) {
		operations.push(linkCID(metadata.userID, session.customer as string));
	}

	const expanded = await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items"] });
	const line_items = expanded.line_items?.data;
	if (!line_items) throw error(500, `couldn't retrieve session`);

	const order: Order = {
		restaurantName: metadata.restaurantName,
		userID: metadata.userID || uuidv4(),
		items: line_items,
		timestamp: Date.now(),
	};

	console.log(`Creating order for ${metadata.restaurantName}`);
	operations.push(putItem("orders", order));
	operations.push(sendReceipt(session.customer_details?.email, order, url));

	await Promise.all(operations);
}

async function sendReceipt(recipient: string | null | undefined, order: Order, url: string) {
	sendMail({
		from: `"${order.restaurantName}" <no-reply@${MAIL_FROM_DOMAIN}>`, // sender address
		to: <string>recipient, // list of receivers
		subject: "Receipt for " + order.restaurantName, // Subject line
		text: `You can view the order at ${new URL("/orders/" + getSlugFromOrder(order), url).href}
${JSON.stringify(order, null, 2)}`, // plain text body
		// html: "<b>Hello world?</b>", // html body
	});
}

async function linkCID(userID: string, stripeCustomerID: string) {
	console.log(`Linking customer ID ${stripeCustomerID} to userID ${userID}`);
	const cmd = new UpdateCommand({
		TableName: "users",
		Key: { userID },
		UpdateExpression: `SET stripeCustomerID = :stripeCustomerID`,
		ExpressionAttributeValues: {
			":stripeCustomerID": stripeCustomerID,
		},
	});
	await ddb.send(cmd);
}
