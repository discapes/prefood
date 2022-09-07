import { Table } from "$lib/server/ddb";
import type { Restaurant } from "$lib/types";
import type { Action } from "@sveltejs/kit";
export const prerender = false;

export const POST: Action = async ({ request: req }) => {
	const json = await req.json();
	const table = new Table<Restaurant>("restaurants").key("name");

	switch (json.action) {
		case "set":
			await table.put(json.restaurant);
			break;
		case "delete":
			await table.delete(json.name);
			break;
	}
};
