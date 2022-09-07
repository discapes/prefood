import { getUserData } from "$lib/server/auth";
import { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals: { userID, sessionToken } }) => {
	return {
		userData: await getUserData({ sessionToken, userID }),
	};
};
