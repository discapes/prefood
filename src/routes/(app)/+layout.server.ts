import { UserAuth } from "$lib/server/services/Account";
import AccountService from "$lib/server/services/AccountService";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	const auth = UserAuth.safeParse(locals);
	if (!auth.success) return {};
	const account = await AccountService.fetchScopedData(auth.data);
	return {
		userData: account,
	};
};
