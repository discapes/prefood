import { ADMIN_EMAIL } from "$env/static/private";
import { COOKIES } from "$lib/addresses";
import { AuthToken } from "$lib/server/services/Account";
import AccountService from "$lib/server/services/AccountService";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
	const auth = AuthToken.parse(cookies.get(COOKIES.AUTHTOKEN));
	const { email } = await AccountService.fetchScopedData(auth);
	if (email !== ADMIN_EMAIL) throw error(403, "Permission denied");

	return {
		motd: "Welcome back, " + ADMIN_EMAIL + ".",
	};
};
