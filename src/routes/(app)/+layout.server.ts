import { Auth } from "$lib/services/Account";
import AccountService from "$lib/services/AccountService";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	const userData = await AccountService.fetchScopedData(Auth.parse(locals));
	return {
		userData,
	};
};
