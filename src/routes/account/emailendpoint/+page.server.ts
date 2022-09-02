export {};

// export const load: PageServerLoad = async ({ url }) => {
// 	const { rememberMe, referer, email } = getDecoder(EmailEndpointOptions).parse(url.searchParams.get("options"));

// 	if (await getUserIDFromIndexedAttr_unsafe({ idFieldName: "email", idValue: email })) {
// 		const userData = await getUserData({});
// 	}
// };

// async function sendLoginEmail({ email, rememberMe, referer, url }: { email: string; rememberMe: boolean; referer: string; url: string }) {
// 	log(`logging in with ${JSON.stringify({ email, rememberMe, url, referer })}`);

// 	let userID = await getUserIDFromIndexedAttr_unsafe({ idFieldName: "email", idValue: email });
// 	let newSessionToken: string;
// 	if (userID) {
// 		log(`userID ${userID} found, adding new session id to user, sending sessionToken to email`);
// 		newSessionToken = await addNewSessionToken_unsafe({ userID });

// 		const options = encrypt(
// 			JSON.stringify({
// 				referer,
// 				rememberMe: rememberMe.toString(),
// 				userID,
// 				sessionToken: newSessionToken,
// 			})
// 		);

// 		const endpoint = new URL("/account/login/email/logincb", url).href;

// 		sendMail({
// 			from: `"${MAIL_FROM_DOMAIN}" <no-reply@${MAIL_FROM_DOMAIN}>`, // sender address
// 			to: <string>email, // list of receivers
// 			subject: `Login link for ${MAIL_FROM_DOMAIN}`, // Subject line
// 			text: `You can login at ${endpoint}?o=${options}`,
// 		});
// 	} else {
// 		log(`userID for email ${email} not found, sending link to create account`);

// 		const token = encrypt(
// 			JSON.stringify({
// 				email,
// 			})
// 		);

// 		const options = encodeB64URL(
// 			JSON.stringify({
// 				token,
// 				email,
// 			})
// 		);

// 		const endpoint = new URL("/account/login/email/signupcb", url).href;

// 		sendMail({
// 			from: `"${MAIL_FROM_DOMAIN}" <no-reply@${MAIL_FROM_DOMAIN}>`, // sender address
// 			to: <string>email, // list of receivers
// 			subject: `Sign-up link for ${MAIL_FROM_DOMAIN}`, // Subject line
// 			text: `You can create an account at ${endpoint}?o=${options}`,
// 		});
// 	}

// 	return "Check your email.";
// }
