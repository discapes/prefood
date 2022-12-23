import RestaurantService from "$lib/server/services/RestaurantService";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
	const restaurant = await RestaurantService.get(params.slug);
	if (!restaurant) throw error(404, "Restaurant not found!");

	return {
		restaurant,
	};
};
