import type { Restaurant } from "$lib/types";
import type { PageLoad } from "./$types";

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	return {
		restaurants: await fetch("/api/restaurants").then((res) => res.json()),
	};
};
