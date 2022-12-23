import { COOKIES } from "$lib/addresses";
import { AuthToken } from "$lib/server/services/Account";
import OrderService from "$lib/server/services/OrderService";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, parent }) => {
	const authCookie = cookies.get(COOKIES.AUTHTOKEN);
	if (authCookie && authCookie.length) {
		const auth = AuthToken.parse(authCookie);
		const orderDataPromise = OrderService.forUser(auth.UID);
		const { userData } = await parent();
		if (userData && userData.userID === auth.UID) {
			const orderData = await orderDataPromise;
			if (!orderData) throw error(500, `couldn't find order data for ${auth.UID}`);
			return {
				userData: userData,
				orders: orderData,
			};
		}
	}
};
