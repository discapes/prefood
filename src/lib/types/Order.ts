import type Stripe from "stripe";

export type Order = {
	restaurantName: string;
	userID: string;
	items: Stripe.LineItem[];
	timestamp: number;
};
