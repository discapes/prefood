import { Table } from "$lib/server/ddb";
import type { Restaurant } from "./Restaurant";

class RestaurantService {
	table = new Table<Restaurant>("restaurants").key("name").clone();
	getAll = () => this.table().scanItems();
	get = (slug: string) => this.table().getItem(slug);
}
export default new RestaurantService();
