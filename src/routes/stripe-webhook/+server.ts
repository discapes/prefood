import type { Action } from "./$types";

export const POST: Action = async () => {
	/*
		TODO
		elsewhere: set the webhook to here
		elsewhere: metadata should include { userID, restaurantID and needToSetCustomerID }

		create a new order with line items, userID and restaurantID 
		set customer id for userID if needToSetCustomerID
		far future: trigger web push notification for subscribers
	 */
};
