import { CONTACT_ADMIN, COOKIES } from "$lib/addresses";
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

	let authToken = cookies.get(COOKIES.AUTHTOKEN);
	let userData;
	if (authToken) {
		try {
			userData = await AccountService.fetchScopedData(authToken);
		} catch (e) {
			cookies.delete(COOKIES.AUTHTOKEN);
			throw error(400, "Invalid authentication. You have been logged out." + CONTACT_ADMIN);
		}
	}
	return {
		userData,
		stateToken,
	};
};
