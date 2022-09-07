import type { TrustedIdentity, AccountCreationData, IdentificationMethod } from "$lib/types";
import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { error } from "@sveltejs/kit";
import { hash } from "$lib/server/crypto";
import { ddb } from "$lib/server/ddb";
import { log } from "$lib/util";
import { verifySenderEmail } from "./email";
import { verifySenderGithub } from "./github";
import { verifySenderGoogle } from "./google";

export async function getTrustedIdentity(url: URL, method: string): Promise<{ i: TrustedIdentity; getACD: () => Promise<AccountCreationData> }> {
	const res = await (() => {
		switch (method) {
			case "githubID":
				return verifySenderGithub(url);
			case "googleID":
				return verifySenderGoogle(url);
			case "email":
				return verifySenderEmail(url);
			default:
				throw error(400, "invalid method");
		}
	})();
	log("got verified identity", res);
	return res;
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

export async function getUserIDFromIndexedAttr_unsafe({ idFieldName, idValue }: { idFieldName: IdentificationMethod; idValue: string }) {
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
