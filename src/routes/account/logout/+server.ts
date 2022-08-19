import { error } from "@sveltejs/kit";
import type { Action } from "./$types";
import { removeSessionID } from "$lib/authentication";

export const POST: Action = async ({ locals: { userID, sessionID } }) => {
	if (!sessionID) throw error("sessionID not specified.");
	if (!userID) throw error("userID not specified.");
	await removeSessionID({ userID, sessionID });
	return new Response(undefined);
};
