import { MAIL_FROM_DOMAIN } from "$env/static/private";
import { URLS } from "$lib/addresses";
import { getEncoderCrypt } from "$lib/server/crypto";
import { sendMail } from "$lib/server/mail";
import { UserAuth, type Edits } from "$lib/services/Account";
import AccountService from "$lib/services/AccountService";
import { EmailLoginCode } from "$lib/types";
import { formEntries, log, trueStrings } from "$lib/util";
import { error } from "@sveltejs/kit";
import sharp from "sharp";
import { z } from "zod";
import type { Actions } from "./$types";

const EditFields = z
	.object({
		name: z.string(),
		bio: z.string(),
	})
	.partial();

type Result = {
	message: string;
};

export const actions: Actions = {
	logout: async ({ locals: { sessionToken, userID }, cookies }): Promise<Result> => {
		if (!sessionToken) throw error(400, "sessionToken not specified.");
		if (!userID) throw error(400, "userID not specified.");
		await AccountService.removeSessionToken({ userID, sessionToken });
		cookies.delete("sessionToken");
		cookies.delete("userID");
		return { message: "Logged out" };
	},
	editprofile: async ({ url, request, locals }): Promise<Result> => {
		const { fields, files } = await formEntries(request);

		const edits: Edits = {
			...EditFields.parse(fields),
			picture: files.picture ? await encodeImage(files.picture) : undefined,
		};
		await AccountService.edit(edits, UserAuth.parse(locals));
		return { message: "edit successful" };

		async function encodeImage(file: File) {
			return await sharp(new Uint8Array(await file.arrayBuffer()))
				.resize(500, 500)
				.rotate()
				.webp()
				.toBuffer();
		}
	},
	deleteaccount: async ({ locals: { sessionToken, userID } }): Promise<Result> => {
		log("deleteaccount");
		return { message: "Delete not yet implemented" };
	},
	revoke: async ({ locals: { sessionToken, userID } }): Promise<Result> => {
		log("revoke");
		return { message: "Revoke not yet implemented" };
	},
	changeemail: async ({ url, request, locals: { sessionToken, userID } }): Promise<Result> => {
		const {
			fields: { email, passState },
		} = await formEntries(request);
		if (!trueStrings(email, passState)) return { message: "invalid" };
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
		return { message: "xxxxt" };
	},
	unlink: async ({ locals: { sessionToken, userID } }): Promise<Result> => {
		log("unlink");
		return { message: "Unlink not yet implemented" };
	},
};
