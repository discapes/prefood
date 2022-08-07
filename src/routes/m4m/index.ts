import type { RequestHandler } from '@sveltejs/kit';
import { getPublicStripe, getSecretStripe } from '$lib/stripe';

export const GET: RequestHandler = async ({ params }) => {
	const stripe = getSecretStripe();
	const paymentIntent = await stripe.paymentIntents.create({
		amount: 100,
		currency: 'eur',
		automatic_payment_methods: {
			enabled: true
		}
	});

	return {
		body: {
			clientSecret: paymentIntent.client_secret
		}
	};
};

export const POST: RequestHandler = async ({ request: req }) => {
	const stripe = getSecretStripe();

	const { paymentIntentID, euros } = await req.json();

	await stripe.paymentIntents.update(paymentIntentID, { amount: euros * 100 });

	return {
		status: 200
	};
};
