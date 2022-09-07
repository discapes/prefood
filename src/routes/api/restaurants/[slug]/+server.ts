import { RestaurantsController } from "$lib/controllers/RestaurantsController";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { jsonResponse } from "$lib/api";

export const GET: RequestHandler = async ({ request: { headers }, params }) => {
	const res = await RestaurantsController.get(params.slug);
	if (!res) throw error(404, "Restaurant not found");
	return jsonResponse(res, headers.get("accept"));
};
