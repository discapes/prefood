import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
	return {
		restaurants: await fetch("/api/restaurants").then((res) => res.json()),
	};
};
