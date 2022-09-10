import { jsonResponse } from "$lib/server/api";
import type { Restaurant } from "$lib/services/Restaurant";
import RestaurantService from "$lib/services/RestaurantService";
import { error } from "@sveltejs/kit";
import { Example, Get, Path, Route, Tags } from "tsoa";
import type { RequestHandler } from "./$types";

@Route("restaurants")
@Tags("restaurantss")
class F {
	/**
	 * @summary Get information about a specific restaurant
	 * @param slug restaurant name
	 * @example slug "mcBurgers"
	 *
	 */
	@Example<Restaurant>({
		menu: [
			{
				name: "a cheese burger",
				image: "/placeholder.jpg",
				price_cents: 1100,
			},
			{
				name: "double cheese burger",
				image: "/placeholder.jpg",
				price_cents: 1600,
			},
			{
				name: "triple cheese burger",
				image: "/placeholder.jpg",
				price_cents: 1900,
			},
		],
		reviews: 132,
		name: "mcBurgers",
		stars: 5,
	})
	@Get("{slug}")
	static async GET(@Path() slug: string): Promise<Restaurant> {
		const res = await RestaurantService.get(slug);
		if (!res) throw error(404);
		return res;
	}
}

export const GET: RequestHandler = async ({ request, params }) =>
	jsonResponse(await F.GET(params.slug), request.headers);
