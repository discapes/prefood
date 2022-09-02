import { ALLOWED_LOGINS } from "$env/static/private";
import { hash } from "$lib/server/crypto";
import ddb from "$lib/server/ddb";
import type { Identity } from "$lib/types";
import { cerror, log } from "$lib/util";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { getUserIDFromIndexedAttr_unsafe, removeSessionToken } from "../lib";

export async function loginOrCreateAccount(acd: Identity) {
	log({ acd });

	let userID = await getUserIDFromIndexedAttr_unsafe({ idFieldName: acd.methodName, idValue: acd.methodValue });
	let newSessionToken: string;
	if (userID) {
		log(`userID ${userID} found, adding new session id to user`);
		newSessionToken = await addNewSessionToken_unsafe({ userID });
	} else {
		log(`userID not found, checking if email ${acd.email} is unique`);
		const userIDWithSameEmail = await getUserIDFromIndexedAttr_unsafe({ idFieldName: "email", idValue: acd.email });
		if (userIDWithSameEmail) {
			log(`email ${acd.email} isn't unique, ${userIDWithSameEmail} owns it`);
			throw new Error(`There already exists an account with the linked email. Login with the email or use another linked authentication method.`);
		} else {
			log(`email ${acd.email} is unique`);
			({ userID, initialSessionToken: newSessionToken } = await createAccount_unsafe(acd));
		}
	}
	return { userID, newSessionToken };
}

// doesn't check for duplicate emails
async function createAccount_unsafe(acd: Identity) {
	const userID = uuidv4();
	const initialSessionToken = uuidv4();
	log(`Creating account with ${JSON.stringify({ userID, acd, initialSessionToken })}`);

	const UpdateExpression = `ADD sessionTokens :newSessionTokens
	SET ${acd.methodName !== "email" ? `${acd.methodName} = :idValue,` : ``}
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
			":newSessionTokens": new Set([hash(initialSessionToken)]),
			":methodValue": acd.methodValue,
			":email": acd.email,
			":name": acd.name,
			":picture": acd.picture,
		},
	});
	await ddb.send(cmd);
	log(`Created account with ${JSON.stringify({ userID, acd, initialSessionToken })}`);
	return { userID, initialSessionToken };
}

async function addNewSessionToken_unsafe({ userID }: { userID: string }) {
	const newSessionToken = uuidv4();
	log(`Adding new session ID ${newSessionToken} to userID ${userID}`);

	const cmd = new UpdateCommand({
		TableName: "users",
		Key: { userID },
		UpdateExpression: `ADD sessionTokens :newSessionTokens`,
		ExpressionAttributeValues: {
			[":newSessionTokens"]: new Set([hash(newSessionToken)]),
		},
		ReturnValues: "UPDATED_NEW",
	});
	const res = await ddb.send(cmd);
	if (res.Attributes) {
		log(`Added session ID ${newSessionToken} to userID ${userID}`);
		const logins: number = res.Attributes.sessionTokens.size;
		if (logins > +ALLOWED_LOGINS) {
			log(`userID has ${logins} logins, which is more than the allowed ${ALLOWED_LOGINS}. Removing oldest.`);
			removeSessionToken({ sessionToken: res!.Attributes!.sessionTokens.values().next().value, userID });
		}
	} else {
		cerror(`Couldn't add session ID ${newSessionToken} to userID ${userID}`);
	}

	return newSessionToken;
}
