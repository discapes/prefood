import { CONTACT_ADMIN, COOKIES } from "$lib/addresses";
import { AuthToken } from "$lib/server/services/Account";
import AccountService from "$lib/server/services/AccountService";
import { uuid } from "$lib/util";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies }) => {
	let stateToken = cookies.get(COOKIES.STATETOKEN);
	if (!stateToken) {
		stateToken = uuid();
		cookies.set(COOKIES.STATETOKEN, stateToken, { path: "/" });
	}

	const authToken = cookies.get(COOKIES.AUTHTOKEN);
	let userData;
	if (authToken && authToken.length) {
		try {
			userData = await AccountService.fetchScopedData(AuthToken.parse(authToken));
		} catch (e) {
			cookies.delete(COOKIES.AUTHTOKEN, { path: "/" });
			throw error(400, "Invalid authentication. You have been logged out." + CONTACT_ADMIN);
		}
	}
	return {
		userData,
		stateToken,
	};
};
