import type { RequestHandler } from '@sveltejs/kit';
import { authenticate } from '$lib/authentication';
import type { Typify, User } from 'src/types/types';

// this function can be put anywhere that needs authentification
export const GET: RequestHandler = async ({ locals: { userID, sessionID } }) => {
	const userData = await authenticate({ sessionID, userID });

	return {
		body: {
			userData: <Typify<User>>userData
		}
	};
};
