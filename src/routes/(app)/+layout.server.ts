import { Auth } from "$lib/services/Account";
import AccountService from "$lib/services/AccountService";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	const auth = Auth.safeParse(locals);
	if (!auth.success) return {};
	const userData = await AccountService.fetchScopedData(auth.data);
	return {
		userData,
	};
};
