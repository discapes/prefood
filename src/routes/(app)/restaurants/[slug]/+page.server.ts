import { Table } from "$lib/server/ddb.js";
import { error } from "@sveltejs/kit";
import type { Restaurant } from "$lib/types";
import type { PageServerLoad } from "./$types";

export const prerender = false;

export const load: PageServerLoad = async ({ params }) => {
	try {
		const res = await new Table<Restaurant>("restaurants").key("name").get(params.slug);

		return {
			restaurant: res,
		};
	} catch (e) {
		throw error(404, "Restaurant not found");
	}
};
