import { getSecretStripe } from "$lib/server/stripe";
import { error } from "@sveltejs/kit";
import type Stripe from "stripe";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
	const session_id = url.searchParams.get("session_id");
	if (!session_id) throw error(400, "Missing session id");
	const stripe = getSecretStripe();
	const session = await stripe.checkout.sessions.retrieve(session_id);
	if (!session.customer) throw error(400, "Invalid session");
	const customer = await stripe.customers.retrieve(session.customer.toString());
	if (!("name" in customer)) throw error(400, "Invalid session");

	return {
		name: customer.name,
		email: customer.email,
	};
};
