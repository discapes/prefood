import type { PageServerLoad, Action } from "./$types";
import { getSecretStripe } from "$lib/stripe";
import { error } from "@sveltejs/kit";

export const prerender = false;

export const load: PageServerLoad = async () => {
	const stripe = getSecretStripe();
	const paymentIntent = await stripe.paymentIntents.create({
		amount: 100,
		currency: "eur",
		automatic_payment_methods: {
			enabled: true,
		},
	});
	if (!paymentIntent.client_secret) throw error(500, `couldn't create paymentintent`);

	return {
		clientSecret: paymentIntent.client_secret,
	};
};

export const POST: Action = async ({ request: req }) => {
	const stripe = getSecretStripe();

	const { paymentIntentID, euros } = await req.json();

	await stripe.paymentIntents.update(paymentIntentID, { amount: euros * 100 });
};
