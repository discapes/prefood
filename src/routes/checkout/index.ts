import type { RequestHandler } from '@sveltejs/kit';
import { getSecretStripe } from '$lib/stripe';
import ddb, { getItem } from '$lib/ddb.js';
import { TAX_RATE_ID } from '$env/static/private';
import type Stripe from 'stripe';
import { getImages, shuffle } from '$lib/util';

export const POST: RequestHandler = async ({ url, request }) => {
	const stripe = getSecretStripe();
	const formData = await request.formData();
	const line_items = await getLineItems(formData);

	const restaurantSlug = formData.get('restaurant-slug');

	const session = await stripe.checkout.sessions.create({
		line_items,
		mode: 'payment',
		success_url: `${url.origin}/orders`,
		cancel_url: `${url.origin}/restaurants/${restaurantSlug}`,
		allow_promotion_codes: true,
		customer_creation: 'always',
		payment_intent_data: {
			description: 'descasdsad',
			statement_descriptor: 'statementdesc'
		}
	});

	return {
		status: 303,
		headers: {
			location: session.url ?? `${url.origin}/cancel`
		}
	};
};

async function getLineItems(
	formData: FormData
): Promise<Stripe.Checkout.SessionCreateParams.LineItem[]> {
	const itemNames = [...formData.keys()].flatMap((i) =>
		i.startsWith('item-') ? [i.slice('item-'.length)] : []
	);

	const restaurantName = formData.get('restaurant-name');
	const restaurantSlug = formData.get('restaurant-slug');
	const menu = (await getItem('restaurants', { slug: <string>restaurantSlug })).menu;

	return Promise.all(
		itemNames.map(async (itemName): Promise<Stripe.Checkout.SessionCreateParams.LineItem> => {
			const item = menu.find((menuItem) => menuItem.name === itemName);
			const images = shuffle(await getImages(item.name, 8));

			return {
				price_data: {
					currency: 'eur',
					unit_amount: item.price_cents,
					product_data: {
						name: item.name + ' - ' + restaurantName,
						images
					}
				},
				quantity: 1,
				adjustable_quantity: {
					enabled: true
				},
				tax_rates: [TAX_RATE_ID]
			};
		})
	);
}
