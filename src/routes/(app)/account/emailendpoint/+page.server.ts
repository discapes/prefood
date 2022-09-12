import { MAIL_FROM_DOMAIN } from "$env/static/private";
import { URLS } from "$lib/addresses";
import { getEncoderCrypt } from "$lib/server/crypto";
import { sendMail } from "$lib/server/mail";
import AccountService from "$lib/server/services/AccountService";
import { EmailLoginCode } from "$lib/types/misc";
import { formEntries, log, trueStrings } from "$lib/util";
import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

type EmailMeSuccess = {
	sent: true;
};

type EmailMeFailure = {
	sent: false;
	email: string;
	passState: string;
};

type EmailMeResult = EmailMeSuccess | EmailMeFailure;

export const load: PageServerLoad = async ({ request }) => {
	if (!(request.method === "POST")) throw redirect(303, ".");
};

export const actions: Actions = {
	loginlink: async ({ url, request }): Promise<EmailMeResult> => {
		const {
			fields: { email, passState },
		} = await formEntries(request);
		log(url.pathname, { email, passState });
		if (typeof email !== "string" || typeof passState !== "string") throw error(400, "invalid request: " + JSON.stringify({ email, passState }));

		if (await AccountService.existsTI({ methodName: "email", methodValue: email })) {
			const code = getEncoderCrypt(EmailLoginCode).encode({
				timestamp: Date.now(),
				email,
			});
			await sendMail({
				from: `"${MAIL_FROM_DOMAIN}" <no-reply@${MAIL_FROM_DOMAIN}>`, // sender address
				to: <string>email, // list of receivers
				subject: `Login link for ${MAIL_FROM_DOMAIN}`, // Subject line
				text: `You can login at ${new URL(URLS.LOGIN, url)}?state=${passState}&code=${code}`,
			});
			return {
				sent: true,
			};
		} else {
			return {
				sent: false,
				email,
				passState,
			};
		}
	},
	newuser: async ({ url, request }): Promise<EmailMeResult> => {
		// sends register link to new user
		const {
			fields: { email, name, picture, passState },
		} = await formEntries(request);
		if (!trueStrings([email, name, picture, passState]))
			return {
				sent: false,
				email: email ?? "",
				passState: passState ?? "",
			};
		log(url.pathname, { email, passState, name, picture });
		// needs to be encrypted so we know receiver actually has email
		const code = getEncoderCrypt(EmailLoginCode).encode({
			timestamp: Date.now(),
			email: email!,
			picture,
			name,
		});
		await sendMail({
			from: `"${MAIL_FROM_DOMAIN}" <no-reply@${MAIL_FROM_DOMAIN}>`, // sender address
			to: <string>email, // list of receivers
			subject: `Account creation link for ${MAIL_FROM_DOMAIN}`, // Subject line
			text: `You can verify at ${new URL(URLS.LOGIN, url)}?state=${passState}&code=${code}`,
		});
		return {
			sent: true,
		};
	},
};
