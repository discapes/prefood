import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
	const restaurant = await fetch(`/api/restaurants/${params.slug}`).then((res) => res.json());

	return {
		restaurant,
	};
};
