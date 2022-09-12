import { getDecoderCrypt } from "$lib/server/crypto";
import { EmailLoginCode, type AccountCreationData, type TrustedIdentity } from "$lib/types/misc";
import { log } from "$lib/util";
import { error } from "@sveltejs/kit";

// verify keeper of url has access to email account
export async function verifyEmailIdentity(url: URL): Promise<{ i: TrustedIdentity; getACD: () => Promise<AccountCreationData> }> {
	const { timestamp, email, name, picture } = getDecoderCrypt(EmailLoginCode).parse(url.searchParams.get("code"));
	log("verifySenderEmail", { timestamp, email, name, picture });

	const MINUTES_10 = 1000 * 60 * 10;
	if (Date.now() - timestamp > MINUTES_10) {
		throw error(400, "link expired");
	}
	log("verification token valid");

	return {
		i: {
			methodName: "email",
			methodValue: email,
		},
		getACD: async () => {
			if (!name || !picture) throw error(400, "name or picture not sent in email, yet tried to create account");
			return {
				methodName: "email",
				methodValue: email,
				email,
				name,
				picture,
			};
		},
	};
}
