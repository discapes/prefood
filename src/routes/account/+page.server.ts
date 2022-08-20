import type { PageServerLoad } from "./$types";
import { authenticate } from "$lib/authentication";
import type { User } from "src/types/types";

export const prerender = false;

// this function can be put anywhere that needs authentification
export const load: PageServerLoad = async ({ locals: { userID, sessionID } }) => {
	const userData = await authenticate({ sessionID, userID });

	return {
		userData: <User>userData,
	};
};
