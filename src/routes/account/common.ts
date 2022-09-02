import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { UnserializableUser, User } from "src/types/types";
import ddb, { getItem } from "../../lib/ddb";
import { decodeB64URL, encodeB64URL, log } from "../../lib/util";
import { decrypt, encrypt, hash } from "../../lib/crypto";
import { z, ZodType } from "zod";
import { getIdentityInfoGoogle } from "./google";
import { getIdentityInfoEmail } from "./email";
import { error } from "@sveltejs/kit";
import { getIdentityInfoGithub } from "./github";

export const IdentificationKeyName = z.union([z.literal("githubID"), z.literal("googleID"), z.literal("email")]);
export type IdentificationKeyName = z.infer<typeof IdentificationKeyName>;

export const Identity = z.object({
	name: z.string(),
	method: IdentificationKeyName,
	picture: z.string(),
	email: z.string(),
});

export type Identity = z.infer<typeof Identity>;

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

export function getDecoder<T extends z.ZodTypeAny>(Type: T) {
	return z.preprocess((a: unknown) => typeof a === "string" && JSON.parse(decodeB64URL(a)), Type);
}
export function getEncoder<T extends z.ZodTypeAny>(Type: T) {
	return {
		encode(a: z.infer<typeof Type>) {
			return encodeB64URL(JSON.stringify(a));
		},
	};
}

export function getDecoderCrypt<T extends z.ZodTypeAny>(Type: T) {
	return z.preprocess((a: unknown) => typeof a === "string" && JSON.parse(decrypt(a)), Type);
}
export function getEncoderCrypt<T extends z.ZodTypeAny>(Type: T) {
	return {
		encode(a: z.infer<typeof Type>) {
			return encrypt(JSON.stringify(a));
		},
	};
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

export const identMethods = z.union([z.literal("googleID"), z.literal("githubID"), z.literal("email")]);

export const Identity = z.object({
	email: z.string(),
	name: z.string(),
	methodValue: z.string(),
	methodName: identMethods,
	picture: z.string(),
});
export type Identity = z.infer<typeof Identity>;

export async function getUserData({ sessionToken, userID }: { sessionToken?: string; userID?: string }) {
	log(`Getting user data with userID ${userID} with sessionToken ${sessionToken}`);
	if (sessionToken && userID) {
		const userData = <UnserializableUser>await getItem("users", { userID });
		if (userData && userData.sessionTokens?.has(hash(sessionToken))) {
			log(`user data found`);
			return { ...userData, sessionTokens: [...userData.sessionTokens] } as User;
		} else {
			log(`user data not found or sessionToken incorrect`);
		}
	}
}

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
