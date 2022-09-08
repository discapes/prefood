import { MAIL_FROM_DOMAIN } from "$env/static/private";
import { URLS } from "$lib/addresses";
import { getEncoderCrypt } from "$lib/server/crypto";
import { sendMail } from "$lib/server/mail";
import AccountService from "$lib/services/AccountService";
import { EmailLoginCode } from "$lib/types";
import { formEntries, log, trueStrings } from "$lib/util";
import { error } from "@sveltejs/kit";
import sharp from "sharp";
import { z } from "zod";
import type { Actions } from "./$types";

export const Edits = z
	.object({
		name: z.string(),
		bio: z.string(),
	})
	.partial();

export const actions: Actions = {
	logout: async ({ locals: { sessionToken, userID }, cookies }) => {
		if (!sessionToken) throw error(400, "sessionToken not specified.");
		if (!userID) throw error(400, "userID not specified.");
		await AccountService.removeSessionToken({ userID, sessionToken });
		cookies.delete("sessionToken");
		cookies.delete("userID");
	},
	editprofile: async ({ url, request, locals: { sessionToken, userID } }) => {
		const { fields, files } = await formEntries(request);
		const edits = Edits.parse(fields);
		if (files.picture) {
			const out = await sharp(new Uint8Array(await files.picture.arrayBuffer()))
				.resize(500, 500)
				.webp()
				.toBuffer();
		}
		throw error(500, "TODO");
	},
	deleteaccount: async ({ locals: { sessionToken, userID } }) => {
		log("deleteaccount");
		throw error(500, "TODO");
	},
	revoke: async ({ locals: { sessionToken, userID } }) => {
		log("revoke");
		throw error(500, "TODO");
	},
	changeemail: async ({ url, request, locals: { sessionToken, userID } }) => {
		const {
			fields: { email, passState },
		} = await formEntries(request);
		if (!trueStrings(email, passState)) return { invalid: true };
		const code = getEncoderCrypt(EmailLoginCode).encode({
			timestamp: Date.now(),
			email,
		});
		await sendMail({
			from: `"${MAIL_FROM_DOMAIN}" <no-reply@${MAIL_FROM_DOMAIN}>`, // sender address
			to: <string>email, // list of receivers
			subject: `Email change link for ${MAIL_FROM_DOMAIN}`, // Subject line
			text: `You can link your new email at ${new URL(
				URLS.LINK,
				url
			)}?state=${passState}&code=${code}`,
		});
	},
	unlink: async ({ locals: { sessionToken, userID } }) => {
		log("unlink");
		throw error(500, "TODO");
	},
};