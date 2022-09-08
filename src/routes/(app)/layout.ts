import { API } from "$lib/addresses";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ fetch }) => {
	return {
		userData: await fetch(`/api/${API.ACCOUNT}`).then((res) => res.json()),
	};
};
