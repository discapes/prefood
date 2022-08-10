import type { RequestHandler } from '@sveltejs/kit';
import ddb from '$lib/ddb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { removeSessionID } from '$lib/authentication';

export const POST: RequestHandler = async ({ locals: { userID, sessionID } }) => {
	if (!sessionID) throw new Error('Internal error: sessionID not specified.');
	if (!userID) throw new Error('Internal error: userID not specified.');
	await removeSessionID({ userID, sessionID });
	return { status: 200 };
};
