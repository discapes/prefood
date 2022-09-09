import { jsonResponse } from "$lib/api";
import type { Restaurant } from "$lib/services/Restaurant";
import RestaurantService from "$lib/services/RestaurantService";
import type { RequestHandler } from "@sveltejs/kit";
import { Example, Get, Route, Tags } from "tsoa";

@Route("restaurants")
@Tags("restaurants")
class F {
	/**
	 * @summary Get information about all restaurants
	 */
	@Example<Restaurant[]>([
		{
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
		},
		{
			menu: [
				{
					name: "small kebab",
					image: "/placeholder.jpg",
					price_cents: 600,
				},
				{
					name: "medium kebab",
					image: "/placeholder.jpg",
					price_cents: 1200,
				},
				{
					name: "large kebab",
					image: "/placeholder.jpg",
					price_cents: 14,
				},
			],
			reviews: 12,
			name: "pizzeria1",
			stars: 4,
		},
	])
	@Get()
	static GET(): Promise<Restaurant[]> {
		return RestaurantService.getAll();
	}
}

export const GET: RequestHandler = ({ request }) =>
	F.GET().then((r) => jsonResponse(r, request.headers));
