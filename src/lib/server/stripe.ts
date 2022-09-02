import { STRIPE_SECRET_KEY } from "$env/static/private";
import Stripe from "stripe";

export function getSecretStripe(): Stripe {
	return new Stripe(STRIPE_SECRET_KEY, {
		apiVersion: "2022-08-01",
	});
}
