import { TAX_RATE_ID } from "$env/static/private";
import { getSecretStripe } from "$lib/server/stripe";
import { UserAuth } from "$lib/server/services/Account";
import AccountService from "$lib/server/services/AccountService";
import type { MenuItem } from "$lib/types/Restaurant";
import RestaurantService from "$lib/server/services/RestaurantService";
import type { SessionMetadata } from "$lib/types/misc";
import { error } from "@sveltejs/kit";
import type Stripe from "stripe";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ url, request, locals: { userID, sessionToken } }) => {
	const userDataP = AccountService.fetchAllData(UserAuth.parse({ userID, sessionToken }));
	const stripe = getSecretStripe();
	const formData = await request.formData();

	const restaurantName = <string | undefined>formData.get("restaurant-name");
	if (!restaurantName) throw error(500, `${restaurantName} not sent`);
	const itemNamesFromFormData = getItemNamesFromFormData(formData);
	const menuItemsP = getMenuItems(restaurantName, itemNamesFromFormData);
	const [userData, menuItems] = await Promise.all([userDataP, menuItemsP]);

	const line_items = getLineItems(restaurantName, menuItems, url.href);

	const metadata: SessionMetadata = {
		userID: userData?.userID ?? "",
		restaurantName,
		linkedCID: userData?.stripeCustomerID ?? "",
	};

	const session = await stripe.checkout.sessions.create({
		line_items,
		mode: "payment",
		success_url: `${url.origin}/orders`,
		cancel_url: `${url.origin}/restaurants/${restaurantName}`,
		allow_promotion_codes: true,
		customer: userData?.stripeCustomerID,
		customer_email: !userData || userData.stripeCustomerID ? undefined : userData.email,
		customer_creation: !userData || userData.stripeCustomerID ? undefined : "always",
		payment_intent_data: {
			statement_descriptor: restaurantName,
			statement_descriptor_suffix: `- ${restaurantName}`,
			setup_future_usage: userData ? "on_session" : undefined,
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
	const restaurant = await RestaurantService.get(restaurantName);
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
					name: item.name,
					description: restaurantName,
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
