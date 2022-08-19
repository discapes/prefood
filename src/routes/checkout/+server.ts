import type { Action } from "./$types";
import { getSecretStripe } from "$lib/stripe";
import { getItem } from "$lib/ddb.js";
import { TAX_RATE_ID } from "$env/static/private";
import type Stripe from "stripe";
import type { Restaurant } from "src/types/types";

export const POST: Action = async ({ url, request }) => {
	const stripe = getSecretStripe();
	const formData = await request.formData();

	const restaurantName = <string | undefined>formData.get("restaurant-name");
	if (!restaurantName) throw new Error(`Internal error: ${restaurantName} not sent`);
	const line_items = await getLineItems(restaurantName, itemNamesFromFormData(formData), url.href);

	//TODO success (if customerID then orders, else banner that says check email)
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
	});

	return new Response(undefined, {
		status: 303,
		headers: {
			location: session.url ?? `${url.origin}/cancel`,
		},
	});
};

function itemNamesFromFormData(formData: FormData) {
	return [...formData.keys()].flatMap((i) => (i.startsWith("item-") ? [i.slice("item-".length)] : []));
}

async function getLineItems(restaurantName: string, itemNames: string[], url: string) {
	const restaurant = <Restaurant | undefined>await getItem("restaurants", { name: restaurantName });
	if (!restaurant) throw new Error(`Internal error: restaurant ${restaurantName} does not exist!`);

	return Promise.all(
		itemNames.map(async (itemName): Promise<Stripe.Checkout.SessionCreateParams.LineItem> => {
			const item = restaurant.menu.find((menuItem) => menuItem.name === itemName);
			if (!item) throw new Error(`Internal error: incorrect item specified: ${itemName}`);
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
		})
	);
}
