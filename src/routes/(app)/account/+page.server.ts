import { MAIL_FROM_DOMAIN } from "$env/static/private";
import { COOKIES, URLS } from "$lib/addresses";
import { getEncoderCrypt, hash } from "$lib/server/crypto";
import { sendMail } from "$lib/server/mail";
import { AuthToken, type Edits } from "$lib/server/services/Account";
import AccountService from "$lib/server/services/AccountService";
import { MAXSCOPES, MINSCOPES } from "$lib/types/Account";
import { EmailLoginCode } from "$lib/types/misc";
import { formEntries, log, trueStrings, zerrorMessage } from "$lib/util";
import { fail, redirect } from "@sveltejs/kit";
import sharp from "sharp";
import { z } from "zod";
import type { Actions } from "./$types";

const EditFields = z
	.object({
		name: z.string().min(3),
		bio: z.string().min(3),
		username: z.string().min(3),
	})
	.partial();

export const actions: Actions = {
	logout: async ({ cookies }) => {
		const auth = AuthToken.parse(cookies.get(COOKIES.AUTHTOKEN));
		await AccountService.removeSessionToken({ UID: auth.UID, SID: auth.SID });
		cookies.delete(COOKIES.AUTHTOKEN, { path: "/" });
		return { success: true, message: "Logged out" };
	},
	editprofile: async ({ request, cookies }) => {
		const { fields, files } = await formEntries(request);
		const parsedFields = EditFields.safeParse(fields);
		if (!parsedFields.success) return fail(400, { success: false, message: zerrorMessage(parsedFields.error) });
		const edits: Edits = {
			...parsedFields.data,
			picture: files.picture ? await encodeImage(files.picture) : undefined,
		};

		const res = await AccountService.edit(edits, AuthToken.parse(cookies.get(COOKIES.AUTHTOKEN)));
		if (!res) return { success: false, message: `Username ${edits.username} is taken` };
		else return { success: true, message: "Edit successful" };

		async function encodeImage(file: File) {
			return await sharp(new Uint8Array(await file.arrayBuffer()))
				.resize(500, 500)
				.rotate()
				.webp()
				.toBuffer();
		}
	},
	savekey: async ({ request, cookies }) => {
		const { fields } = await formEntries(request);
		const scopes = new Set([...Object.keys(fields).filter((k) => k !== "key" && MAXSCOPES.has(k)), ...MINSCOPES]);
		const { key } = fields;
		if (!key) return { success: false, message: "error: no key" };
		await AccountService.setApiKey(AuthToken.parse(cookies.get(COOKIES.AUTHTOKEN)), { key, scopes });
		return { success: true, message: "Key saved" };
	},
	deletekey: async ({ request, cookies }) => {
		const key = await request.formData().then((f) => f.get("key"));
		if (typeof key !== "string") return { success: false, message: "error: no key" };
		await AccountService.deleteApiKey(AuthToken.parse(cookies.get(COOKIES.AUTHTOKEN)), key);
		return { success: true, message: "Key deleted" };
	},
	deleteaccount: async ({ cookies }) => {
		await AccountService.deleteUser(AuthToken.parse(cookies.get(COOKIES.AUTHTOKEN)));
		cookies.delete(COOKIES.AUTHTOKEN);
		throw redirect(303, URLS.ACCOUNT);
		// return { success: true, message: "Account deleted" };
	},
	revoke: async ({ cookies }) => {
		const auth = AuthToken.parse(cookies.get(COOKIES.AUTHTOKEN));
		AccountService.setAttribute(auth, { key: "sessionTokens", value: new Set([hash(auth.SID)]) });
		return { success: true, message: "All other login sessions are now invalid" };
	},
	changeemail: async ({ url, request }) => {
		const {
			fields: { email, passState },
		} = await formEntries(request);
		if (!trueStrings([email, passState])) return { success: false, message: "invalid" };
		const code = getEncoderCrypt(EmailLoginCode).encode({
			timestamp: Date.now(),
			email: <string>email,
		});
		await sendMail({
			from: `"${MAIL_FROM_DOMAIN}" <no-reply@${MAIL_FROM_DOMAIN}>`, // sender address
			to: <string>email, // list of receivers
			subject: `Email change link for ${MAIL_FROM_DOMAIN}`, // Subject line
			text: `You can link your new email at ${new URL(URLS.LOGIN, url)}?state=${passState}&code=${code}`,
		});
		return { success: true, message: "Check your new mail" };
	},
	unlink: async ({ request }) => {
		log("unlink");
		return { success: false, message: `Unlink not yet implemented ${await request.formData()}` };
	},
};
