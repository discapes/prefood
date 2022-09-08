import { API } from "$lib/addresses";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
	return {
		restaurants: await fetch(`api/${API.RESTAURANTS}`).then((res) => res.json()),
	};
};
