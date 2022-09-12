import AccountService from "$lib/server/services/AccountService";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
	const user = await AccountService.getPublicDataByUsername(params.username);

	return {
		user,
	};
};
