import { Table } from "$lib/server/ddb";
import type { Restaurant } from "$lib/types";
import { Example, Get, Path, Route, Tags } from "tsoa";

@Route("restaurants")
@Tags("restaurants")
export class RestaurantsController {
	static table = new Table<Restaurant>("restaurants").key("name");

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
	static async getAll(): Promise<Restaurant[]> {
		return await this.table.scan();
	}

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
	static async get(@Path() slug: string): Promise<Restaurant | undefined> {
		return this.table.get(slug);
	}
}
