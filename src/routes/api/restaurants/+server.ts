import type { RequestHandler } from "./$types";
import { RestaurantsController } from "$lib/controllers/RestaurantsController";

export const GET: RequestHandler = () => {
	return new Response(JSON.stringify(RestaurantsController.getAll()));
};
