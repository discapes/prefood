import { Table } from "$lib/server/ddb";
import type { Restaurant } from "$lib/types";
import { Get, Path, Route } from "tsoa";

@Route("restaurants")
export class RestaurantsController {
	static table = new Table<Restaurant>("restaurants").key("name");

	@Get()
	static async getAll(): Promise<Restaurant[]> {
		return await this.table.scan();
	}
	@Get("{slug}")
	static async get(@Path() slug: string): Promise<Restaurant | undefined> {
		return this.table.get(slug);
	}
}
