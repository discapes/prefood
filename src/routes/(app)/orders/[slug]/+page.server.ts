import OrderService from "$lib/server/services/OrderService";
import { getDataFromOrderSlug } from "$lib/util";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
	const { userID, timestamp } = getDataFromOrderSlug(params.slug);
	if (!userID || !timestamp) throw error(400, `invalid slug: userID ${userID} timestamp ${timestamp}`);

	const order = await OrderService.getSpecific({ userID, timestamp });
	if (!order) throw error(404, `Order ${params.slug} not found.`);

	return {
		order,
	};
};
