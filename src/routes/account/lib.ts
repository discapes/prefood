import type { IdentificationKeyName, Identity } from "$lib/types";
import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { error } from "@sveltejs/kit";
import { hash } from "../../lib/server/crypto";
import ddb from "../../lib/server/ddb";
import { log } from "../../lib/util";
import { getIdentityInfoEmail } from "./email";
import { getIdentityInfoGithub } from "./github";
import { getIdentityInfoGoogle } from "./google";

export function getIdentityFromURL(url: URL, method: string): Promise<Identity> {
	switch (method) {
		case "githubID":
			return getIdentityInfoGithub(url);
		case "googleID":
			return getIdentityInfoGoogle(url);
		case "email":
			return getIdentityInfoEmail(url);
		default:
			throw error(400, "invalid method");
	}
}

/*
	problem that zod solves:
	if i want to make sure that x is a string, 
	and then have typescript know that it's a string,
	i can do assert(typeof x === "string")
	but
	i can't do assert(typeof x === "myobject")
	sure i could verify it, but id need to type the schema twice.
	*/

export async function getUserIDFromIndexedAttr_unsafe({ idFieldName, idValue }: { idFieldName: IdentificationKeyName; idValue: string }) {
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

export async function removeSessionToken({ sessionToken, userID }: { sessionToken: string; userID: string }) {
	log(`Removing session ID ${sessionToken} from userID ${userID}`);
	const cmd = new UpdateCommand({
		TableName: "users",
		Key: { userID },
		UpdateExpression: `DELETE sessionTokens :delsessionToken`,
		ExpressionAttributeValues: {
			":delsessionToken": new Set([hash(sessionToken)]),
		},
	});
	await ddb.send(cmd);
	log(`Removed session ID ${sessionToken} from userID ${userID}`);
}
