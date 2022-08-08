import type { RequestHandler } from '@sveltejs/kit';
import { OAuth2Client } from 'google-auth-library';
import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
import { SESSION_MAXAGE_HOURS } from '$env/static/private';
import { v4 as uuidv4 } from 'uuid';
import * as cookie from 'cookie';
import { authenticate, createOrUpdateAccount } from '$lib/authentication';

// this function can be put anywhere that needs authentification
export const GET: RequestHandler = async ({ locals: { userID, sessionID } }) => {
	const userData = await authenticate({ sessionID, userID });

	return {
		body: {
			userData
		}
	};
};

export const POST: RequestHandler = async (e) => {
	const { tokenID, rememberMe } = Object.fromEntries(await e.request.formData());
	if (!tokenID) throw new Error('Internal error: tokenID not specified.');
	if (!rememberMe) throw new Error('Internal error: rememberMe not specified.');

	const { userID, sessionID, payload } = await verify(<string>tokenID);
	await createOrUpdateAccount({ sessionID, userID, payload });

	const cookieOpts = rememberMe == 'true' ? { maxAge: +SESSION_MAXAGE_HOURS * 60 * 60 } : {};
	return {
		status: 303,
		headers: {
			location: e.request.headers.get('Referer') ?? e.url.href,
			'set-cookie': [cookie.serialize('userID', userID, cookieOpts), cookie.serialize('sessionID', sessionID, cookieOpts)]
		}
	};

	async function verify(tokenID: string) {
		const gClient = new OAuth2Client(PUBLIC_GOOGLE_CLIENT_ID);
		const ticket = await gClient.verifyIdToken({
			idToken: tokenID,
			audience: PUBLIC_GOOGLE_CLIENT_ID
		});
		const payload = ticket.getPayload();
		if (!payload) throw new Error('Error: payload not defined');

		const userID = payload['sub'];
		const sessionID = uuidv4();
		return { userID, sessionID, payload };
	}
};
