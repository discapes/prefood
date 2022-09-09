import { Auth } from "$lib/services/Account";
import AccountService from "$lib/services/AccountService";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	const auth = Auth.safeParse(locals);
	if (!auth.success) return {};
	const userData = await AccountService.fetchScopedData(auth.data);
	if (!userData) return {};
	if (typeof userData.picture === "object")
		userData.picture =
			"data:image/webp;base64," + Buffer.from(userData.picture).toString("base64");
	return {
		userData,
	};
};
