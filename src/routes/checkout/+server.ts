import type { RequestHandler } from "./$types";
import { getSecretStripe } from "$lib/stripe";
import { getItem } from "$lib/ddb.js";
import { TAX_RATE_ID } from "$env/static/private";
import type Stripe from "stripe";
import type { MenuItem, Restaurant, SessionMetadata } from "src/types/types";
import { error } from "@sveltejs/kit";
import { authenticate } from "$lib/authentication";

export const POST: RequestHandler = async ({ url, request, locals: { userID, sessionID } }) => {
	const userDataP = authenticate({ sessionID, userID });
	const stripe = getSecretStripe();
	const formData = await request.formData();

	const restaurantName = <string | undefined>formData.get("restaurant-name");
	if (!restaurantName) throw error(500, `${restaurantName} not sent`);
	const itemNamesFromFormData = getItemNamesFromFormData(formData);
	const menuItemsP = getMenuItems(restaurantName, itemNamesFromFormData);
	const [userData, menuItems] = await Promise.all([userDataP, menuItemsP]);

	if (!userData) throw error(400, "login to order");

	const line_items = getLineItems(restaurantName, menuItems, url.href);

	const metadata: SessionMetadata = {
		itemsJSON: JSON.stringify(menuItems),
		userID: userData.userID,
		restaurantName,
	};

	const session = await stripe.checkout.sessions.create({
		line_items,
		mode: "payment",
		success_url: `${url.origin}/orders`,
		cancel_url: `${url.origin}/restaurants/${restaurantName}`,
		allow_promotion_codes: true,
		customer_creation: "always",
		payment_intent_data: {
			statement_descriptor: restaurantName,
			statement_descriptor_suffix: `- ${restaurantName}`,
		},
		metadata,
	});

	return new Response(undefined, {
		status: 303,
		headers: {
			location: session.url ?? `${url.origin}/cancel`,
		},
	});
};

function getItemNamesFromFormData(formData: FormData) {
	return [...formData.keys()].flatMap((i) => (i.startsWith("item-") ? [i.slice("item-".length)] : []));
}

async function getMenuItems(restaurantName: string, itemNames: string[]) {
	const restaurant = <Restaurant | undefined>await getItem("restaurants", { name: restaurantName });
	if (!restaurant) throw error(500, `restaurant ${restaurantName} does not exist!`);

	const filtered = restaurant.menu.filter((mi) => itemNames.includes(mi.name));
	if (filtered.length !== itemNames.length) throw error(400, `incorrect items specified: ${itemNames}`);
	return filtered;
}

function getLineItems(restaurantName: string, menuItems: MenuItem[], url: string): Stripe.Checkout.SessionCreateParams.LineItem[] {
	return menuItems.map((item) => {
		return {
			price_data: {
				currency: "eur",
				unit_amount: item.price_cents,
				product_data: {
					name: item.name + " - " + restaurantName,
					images: [new URL(item.image, url).href],
				},
			},
			quantity: 1,
			adjustable_quantity: {
				enabled: true,
			},
			tax_rates: [TAX_RATE_ID],
		};
	});
}
