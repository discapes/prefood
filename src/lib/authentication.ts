import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { UnserializableUser, User } from "src/types/types";
import ddb, { getItem } from "./ddb";
import { ALLOWED_LOGINS, MAIL_FROM_DOMAIN, SESSION_MAXAGE_HOURS } from "$env/static/private";
import { v4 as uuidv4 } from "uuid";
import * as cookie from "cookie";
import { encodeB64URL, error, log } from "./util";
import { sendMail } from "./mail";
import { encrypt, hash } from "./crypto";

type IdentificationKeyName = "githubID" | "googleID" | "email";

export async function getUserData({ sessionID, userID }: { sessionID?: string; userID?: string }) {
	log(`Getting user data with userID ${userID} with sessionID ${sessionID}`);
	if (sessionID && userID) {
		const userData = <UnserializableUser>await getItem("users", { userID });
		if (userData && userData.sessionIDs?.has(hash(sessionID))) {
			log(`user data found`);
			return { ...userData, sessionIDs: [...userData.sessionIDs] } as User;
		} else {
			log(`user data not found or sessionID incorrect`);
		}
	}
}

export async function loginWithExternalIdentity({
	idFieldName,
	idValue,
	rememberMe,
	profileData,
	redirect,
}: {
	idFieldName: IdentificationKeyName;
	idValue: string;
	rememberMe: boolean;
	profileData: Omit<User, "userID">;
	redirect: string;
}) {
	log(`logging in with ${JSON.stringify({ idFieldName, idValue, rememberMe, profileData, redirect })}`);

	let userID = await getUserIDFromIndexedAttr_unsafe({ idFieldName, idValue });
	let newSessionID: string;
	if (userID) {
		log(`userID ${userID} found, adding new session id to user`);
		newSessionID = await addNewSessionID_unsafe({ userID });
	} else {
		log(`userID not found, checking if email ${profileData.email} is unique`);
		const userIDWithSameEmail = await getUserIDFromIndexedAttr_unsafe({ idFieldName: "email", idValue: profileData.email });
		if (userIDWithSameEmail) {
			log(`email ${profileData.email} isn't unique, ${userIDWithSameEmail} owns it`);
			error(`There already exists an account with the linked email. Login with the email or use another linked authentication method.`);
			return new Response();
		} else {
			log(`email ${profileData.email} is unique`);
			({ userID, initialSessionID: newSessionID } = await createAccount_unsafe({ idFieldName, idValue, profileData }));
		}
	}

	const cookieOpts: cookie.CookieSerializeOptions = {
		maxAge: rememberMe ? +SESSION_MAXAGE_HOURS * 60 * 60 : undefined,
		path: "/",
	};

	const headers = new Headers({
		location: redirect,
	});
	headers.append("set-cookie", cookie.serialize("userID", userID, cookieOpts));
	headers.append("set-cookie", cookie.serialize("sessionID", newSessionID, cookieOpts));

	return new Response(null, {
		status: 303,
		headers,
	});
}

export async function loginWithEmail({ email, rememberMe, referer, url }: { email: string; rememberMe: boolean; referer: string; url: string }) {
	log(`logging in with ${JSON.stringify({ email, rememberMe, url, referer })}`);

	let userID = await getUserIDFromIndexedAttr_unsafe({ idFieldName: "email", idValue: email });
	let newSessionID: string;
	if (userID) {
		log(`userID ${userID} found, adding new session id to user, sending sessionid to email`);
		newSessionID = await addNewSessionID_unsafe({ userID });

		const options = encrypt(
			JSON.stringify({
				referer,
				rememberMe: rememberMe.toString(),
				userID,
				sessionID: newSessionID,
			})
		);

		const endpoint = new URL("/account/login/email/logincb", url).href;

		sendMail({
			from: `"${MAIL_FROM_DOMAIN}" <no-reply@${MAIL_FROM_DOMAIN}>`, // sender address
			to: <string>email, // list of receivers
			subject: `Login link for ${MAIL_FROM_DOMAIN}`, // Subject line
			text: `You can login at ${endpoint}?o=${options}`,
		});
	} else {
		log(`userID for email ${email} not found, sending link to create account`);

		const token = encrypt(
			JSON.stringify({
				email,
			})
		);

		const options = encodeB64URL(
			JSON.stringify({
				token,
				email,
			})
		);

		const endpoint = new URL("/account/login/email/signupcb", url).href;

		sendMail({
			from: `"${MAIL_FROM_DOMAIN}" <no-reply@${MAIL_FROM_DOMAIN}>`, // sender address
			to: <string>email, // list of receivers
			subject: `Sign-up link for ${MAIL_FROM_DOMAIN}`, // Subject line
			text: `You can create an account at ${endpoint}?o=${options}`,
		});
	}

	return "Check your email.";
}

async function createAccount_unsafe({
	idFieldName,
	idValue,
	profileData,
}: {
	idFieldName?: IdentificationKeyName;
	idValue?: string;
	profileData: Omit<User, "userID">;
}) {
	const userID = uuidv4();
	const initialSessionID = uuidv4();
	log(`Creating account with ${JSON.stringify({ userID, idFieldName, idValue, profileData, initialSessionID })}`);

	const UpdateExpression = `ADD sessionIDs :newSessionIDs
	SET ${idFieldName ? `${idFieldName} = :idValue,` : ``}
	email = :email,
	#name = :name,
	picture = :picture`;

	const cmd = new UpdateCommand({
		TableName: "users",
		Key: { userID },
		UpdateExpression,
		ExpressionAttributeNames: {
			"#name": "name",
		},
		ExpressionAttributeValues: {
			":newSessionIDs": new Set([hash(initialSessionID)]),
			":idValue": idValue,
			":email": profileData.email,
			":name": profileData.name,
			":picture": profileData.picture,
		},
	});
	await ddb.send(cmd);
	log(`Created account with ${JSON.stringify({ userID, idFieldName, idValue, profileData, initialSessionID })}`);
	return { userID, initialSessionID };
}

export async function linkExternalAccount({
	idFieldName,
	idValue,
	userID,
	sessionID,
}: {
	idFieldName: IdentificationKeyName;
	idValue: string;
	userID: string;
	sessionID: string;
}) {
	log(`Checking if ${idFieldName} ${idValue} is already linked to an account`);
	const userIDWithAccountLinked = await getUserIDFromIndexedAttr_unsafe({ idFieldName, idValue });
	if (userIDWithAccountLinked) {
		log(`${idFieldName} ${idValue} is already linked to an account`);
		error(`This identification method is already linked to another account!`);
	} else {
		log(`${idFieldName} ${idValue} isn't linked to another account`);
		log(`Linking ${idFieldName} ${idValue} to userID ${userID} authenticated by ${sessionID}`);

		const cmd = new UpdateCommand({
			TableName: "users",
			Key: { userID },
			UpdateExpression: `SET ${idFieldName} = :idValue`,
			ExpressionAttributeValues: {
				":idValue": idValue,
				":sessionID": hash(sessionID),
			},
			ConditionExpression: `contains(sessionIDs, :sessionID)`,
			ReturnValues: "UPDATED_NEW",
		});
		const res = await ddb.send(cmd);
		if (res.Attributes) {
			log(`Successfully linked ${idFieldName} ${idValue} to userID ${userID} authenticated by ${sessionID}`);
		} else {
			error(`Couldn't link ${idFieldName} ${idValue} to userID ${userID} authenticated by ${sessionID}`);
		}
	}
}

async function getUserIDFromIndexedAttr_unsafe({ idFieldName, idValue }: { idFieldName: IdentificationKeyName; idValue: string }) {
	log(`Getting userID for ${idFieldName} ${idValue}`);
	const cmd = new QueryCommand({
		TableName: "users",
		IndexName: `${idFieldName}-index`,
		KeyConditionExpression: `${idFieldName} = :idValue`,
		ExpressionAttributeValues: {
			":idValue": idValue,
		},
		ProjectionExpression: "userID",
	});
	const res = await ddb.send(cmd);
	if (!res.Items?.length) {
		log(`userID not found for ${idFieldName} ${idValue}`);
		return false;
	} else {
		const userID = res.Items[0].userID;
		log(`userID ${userID} found for ${idFieldName} ${idValue}`);
		return userID;
	}
}

async function addNewSessionID_unsafe({ userID }: { userID: string }) {
	const newSessionID = uuidv4();
	log(`Adding new session ID ${newSessionID} to userID ${userID}`);

	const cmd = new UpdateCommand({
		TableName: "users",
		Key: { userID },
		UpdateExpression: `ADD sessionIDs :newSessionIDs`,
		ExpressionAttributeValues: {
			[":newSessionIDs"]: new Set([hash(newSessionID)]),
		},
		ReturnValues: "UPDATED_NEW",
	});
	const res = await ddb.send(cmd);
	if (res.Attributes) {
		log(`Added session ID ${newSessionID} to userID ${userID}`);
		const logins: number = res.Attributes.sessionIDs.size;
		if (logins > +ALLOWED_LOGINS) {
			log(`userID has ${logins} logins, which is more than the allowed ${ALLOWED_LOGINS}. Removing oldest.`);
			removeSessionID({ sessionID: res!.Attributes!.sessionIDs.values().next().value, userID });
		}
	} else {
		error(`Couldn't add session ID ${newSessionID} to userID ${userID}`);
	}

	return newSessionID;
}

export async function removeSessionID({ sessionID, userID }: { sessionID: string; userID: string }) {
	log(`Removing session ID ${sessionID} from userID ${userID}`);
	const cmd = new UpdateCommand({
		TableName: "users",
		Key: { userID },
		UpdateExpression: `DELETE sessionIDs :delSessionID`,
		ExpressionAttributeValues: {
			":delSessionID": new Set([hash(sessionID)]),
		},
	});
	await ddb.send(cmd);
	log(`Removed session ID ${sessionID} from userID ${userID}`);
}
