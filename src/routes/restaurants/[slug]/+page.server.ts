import { getItem } from "$lib/ddb.js";
import { error } from "@sveltejs/kit";
import type { Restaurant } from "../../types/types";
import type { PageServerLoad } from "./$types";

export const prerender = false;

export const load: PageServerLoad = async ({ params }) => {
	const res = <Restaurant | undefined>await getItem("restaurants", { name: params.slug });

	if (!res) throw error(404, `Restaurant ${params.slug} not found.`);

	return {
		restaurant: res,
	};
};
