import type { RequestHandler } from "./$types";
import { RestaurantsController } from "$lib/controllers/RestaurantsController";
import { jsonResponse } from "$lib/api";

export const GET: RequestHandler = async ({ request: { headers } }) => {
	return jsonResponse(await RestaurantsController.getAll(), headers.get("accept"));
};
