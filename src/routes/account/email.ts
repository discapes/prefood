import { error } from "@sveltejs/kit";
import { z } from "zod";
import { getDecoderCrypt, Identity } from "./common";

const EmailCode = z.object({
	timestamp: z.number(),
	email: z.string(),
	name: z.string(),
	picture: z.string(),
});

export async function getIdentityInfoEmail(url: URL): Promise<Identity> {
	const { timestamp, email, name, picture } = getDecoderCrypt(EmailCode).parse(url.searchParams.get("code"));

	const MINUTES_10 = 1000 * 60 * 10;
	if (Date.now() - timestamp > MINUTES_10) {
		throw error(400, "link expired");
	}

	return {
		methodName: "email",
		methodValue: email,
		name,
		email,
		picture,
	};
}
