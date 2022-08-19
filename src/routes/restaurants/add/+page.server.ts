import type { Action } from "@sveltejs/kit";
import { putItem, deleteItem } from "$lib/ddb";

export const prerender = false;

export const POST: Action = async ({ request: req }) => {
	const json = await req.json();

	switch (json.action) {
		case "set":
			await putItem("restaurants", json.restaurant);
			break;
		case "delete":
			await deleteItem("restaurants", { name: json.name });
			break;
	}
};
