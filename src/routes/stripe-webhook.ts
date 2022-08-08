import ddb from '$lib/ddb';
import type { RequestHandler } from '@sveltejs/kit';
import Stripe from 'stripe';

export const POST: RequestHandler = async (e) => {
	/*
		TODO
		elsewhere: set the webhook to here
		elsewhere: metadata should include { userID, restaurantID and needToSetCustomerID }

		create a new order with line items, userID and restaurantID 
		set customer id for userID if needToSetCustomerID
		far future: trigger web push notification for subscribers
	 */
	return {
		status: 200
	};
};
