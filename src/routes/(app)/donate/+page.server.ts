import { getSecretStripe } from "$lib/server/stripe";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

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

// export const actions: Actions = {
// 	default: async ({ request: req }) => {
// 		const stripe = getSecretStripe();

// 		const { paymentIntentID, euros } = await req.json();

// 		await stripe.paymentIntents.update(paymentIntentID, { amount: euros * 100 });
// 	},
// };
