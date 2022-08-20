import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { removeSessionID } from "$lib/authentication";

export const POST: RequestHandler = async ({ locals: { userID, sessionID } }) => {
	if (!sessionID) throw error(400, "sessionID not specified.");
	if (!userID) throw error(400, "userID not specified.");
	await removeSessionID({ userID, sessionID });
	return new Response(undefined);
};
