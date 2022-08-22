import type { PageServerLoad } from "./$types";
import { getUserData } from "$lib/authentication";
import type { User } from "src/types/types";

export const prerender = false;

// this function can be put anywhere that needs authentification
export const load: PageServerLoad = async ({ locals: { userID, sessionID } }) => {
	const userData = await getUserData({ sessionID, userID });

	return {
		userData: <User>userData,
	};
};
