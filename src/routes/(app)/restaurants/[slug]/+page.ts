import { API } from "$lib/addresses";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
	const restaurant = await fetch(`/api/${API.RESTAURANTS}/${params.slug}`).then((res) => res.json());

	return {
		restaurant,
	};
};
