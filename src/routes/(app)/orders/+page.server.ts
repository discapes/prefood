import OrderService from "$lib/server/services/OrderService";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { userID }, parent }) => {
	if (userID) {
		let orderDataPromise = OrderService.forUser(userID);
		const { userData } = await parent();
		if (userData) {
			const orderData = await orderDataPromise;
			if (!orderData) throw error(500, `couldn't find order data from ${userID}`);
			return {
				userData: userData,
				orders: orderData,
			};
		}
	}
};
