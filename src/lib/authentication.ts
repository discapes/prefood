import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { TokenPayload } from "google-auth-library";
import type { UnserializableUser, User } from "src/types/types";
import ddb, { getItem } from "./ddb";
import { v4 as uuidv4 } from "uuid";

type IdentificationKeyName = "githubID" | "googleID";

export async function authenticate({ sessionID, userID }: { sessionID?: string; userID?: string }) {
	console.log(`Authenticating with userID ${userID} with sessionID ${sessionID}`);
	if (sessionID && userID) {
		const userData = <UnserializableUser>await getItem("users", { userID });
		if (userData && userData.sessionIDs?.has(sessionID)) {
			return { ...userData, sessionIDs: [...userData.sessionIDs] } as User;
		}
	}
}

export async function linkGoogle({ userID, googleID, g_payload }: { userID: string; googleID: string; g_payload: TokenPayload }) {
	console.log(`Linking googleID ${googleID} to userID ${userID}`);
	const cmd = new UpdateCommand({
		TableName: "users",
		Key: { userID },
		UpdateExpression: `SET g_payload = :g_payload, googleID = :googleID`,
		ExpressionAttributeValues: {
			":g_payload": g_payload,
			":googleID": googleID,
		},
	});
	return await ddb.send(cmd);
}

export async function linkGithub({ userID, githubID }: { userID: string; githubID: string }) {
	console.log(`Linking githubID ${githubID} to userID ${userID}`);
	const cmd = new UpdateCommand({
		TableName: "users",
		Key: { userID },
		UpdateExpression: `SET githubID = :githubID`,
		ExpressionAttributeValues: {
			":githubID": githubID,
		},
	});
	return await ddb.send(cmd);
}

export async function createAccountFromGooglePayload({ googleID, g_payload }: { googleID: string; g_payload: TokenPayload }) {
	const userID = uuidv4();
	const initialSessionID = uuidv4();
	console.log(`Creating account from google payload with userID ${userID}, googleID ${googleID}`);

	const cmd = new UpdateCommand({
		TableName: "users",
		Key: { userID },
		UpdateExpression: `ADD sessionIDs :newSessionIDs
							SET	g_payload = :g_payload,
							googleID = :googleID,
							email = :email,
							#name = :name,
							picture = :picture`,
		ExpressionAttributeNames: {
			"#name": "name",
		},
		ExpressionAttributeValues: {
			":newSessionIDs": new Set([initialSessionID]),
			":googleID": googleID,
			":g_payload": g_payload,
			":email": g_payload.email,
			":name": g_payload.name,
			":picture": g_payload.picture,
		},
	});
	await ddb.send(cmd);
	return { userID, initialSessionID };
}

export async function getUserID({ idFieldName, idValue }: { idFieldName: IdentificationKeyName; idValue: string }) {
	console.log(`Getting userID for ${idFieldName} ${idValue}`);
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
		console.log("userID not found");
		return undefined;
	} else {
		const userID = res.Items[0].userID;
		console.log(`userID ${userID} found`);
		return userID;
	}
}

export async function addNewSessionID({ userID }: { userID: string }) {
	const newSessionID = uuidv4();
	console.log(`Adding new session ID ${newSessionID} to userID ${userID}`);

	const cmd = new UpdateCommand({
		TableName: "users",
		Key: { userID },
		UpdateExpression: `ADD sessionIDs :newSessionIDs`,
		ExpressionAttributeValues: {
			[":newSessionIDs"]: new Set([newSessionID]),
		},
	});
	await ddb.send(cmd);
	return newSessionID;
}

export async function removeSessionID({ sessionID, userID }: { sessionID: string; userID: string }) {
	console.log(`Removing session ID ${sessionID} from userID ${userID}`);
	const cmd = new UpdateCommand({
		TableName: "users",
		Key: { userID },
		UpdateExpression: `DELETE sessionIDs :delSessionID`,
		ExpressionAttributeValues: {
			":delSessionID": new Set([sessionID]),
		},
	});
	return await ddb.send(cmd);
}
