import type { RequestHandler } from '../../../.svelte-kit/types/src/routes/pay/__types';
import Stripe from 'stripe';
import { STRIPE_KEY, DOMAIN } from '$env/static/private';

export const POST: RequestHandler = async () => {
	const stripe = new Stripe(STRIPE_KEY, {
		apiVersion: '2022-08-01'
	});
	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price: 'price_1LTya3Jiorwz5WDKlUkTNBcZ',
				quantity: 1
			}
		],
		mode: 'payment',
		success_url: `https://${DOMAIN}/pay/success`,
		cancel_url: `https://${DOMAIN}/pay/cancel`
	});

	return {
		status: 303,
		headers: {
			location: session.url ?? 'fail.com'
		},
		body: {}
	};
};
