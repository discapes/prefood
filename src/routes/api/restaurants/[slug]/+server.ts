import { RestaurantsController } from "$lib/controllers/RestaurantsController";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
	const res = await RestaurantsController.get(params.slug);
	if (!res) throw error(404, "Restaurant not found");
	return new Response(JSON.stringify(res));
};
