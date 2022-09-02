import { hash } from "$lib/server/crypto";
import ddb from "$lib/server/ddb";
import type { IdentificationKeyName } from "$lib/types";
import { cerror, log } from "$lib/util";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getUserIDFromIndexedAttr_unsafe } from "../lib";

export async function linkExternalAccount({
	idFieldName,
	idValue,
	userID,
	sessionToken,
}: {
	idFieldName: IdentificationKeyName;
	idValue: string;
	userID: string;
	sessionToken: string;
}) {
	log(`Checking if ${idFieldName} ${idValue} is already linked to an account`);
	const userIDWithAccountLinked = await getUserIDFromIndexedAttr_unsafe({ idFieldName, idValue });
	if (userIDWithAccountLinked) {
		log(`${idFieldName} ${idValue} is already linked to an account`);
		cerror(`This identification method is already linked to another account!`);
	} else {
		log(`${idFieldName} ${idValue} isn't linked to another account`);
		log(`Linking ${idFieldName} ${idValue} to userID ${userID} authenticated by ${sessionToken}`);

		const cmd = new UpdateCommand({
			TableName: "users",
			Key: { userID },
			UpdateExpression: `SET ${idFieldName} = :idValue`,
			ExpressionAttributeValues: {
				":idValue": idValue,
				":sessionToken": hash(sessionToken),
			},
			ConditionExpression: `contains(sessionTokens, :sessionToken)`,
			ReturnValues: "UPDATED_NEW",
		});
		const res = await ddb.send(cmd);
		if (res.Attributes) {
			log(`Successfully linked ${idFieldName} ${idValue} to userID ${userID} authenticated by ${sessionToken}`);
		} else {
			cerror(`Couldn't link ${idFieldName} ${idValue} to userID ${userID} authenticated by ${sessionToken}`);
		}
	}
}
