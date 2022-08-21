import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { TokenPayload } from "google-auth-library";
import type { UnserializableUser, User } from "src/types/types";
import ddb, { getItem } from "./ddb";
import { ALLOWED_LOGINS, SESSION_MAXAGE_HOURS } from "$env/static/private";
import { v4 as uuidv4 } from "uuid";
import * as cookie from "cookie";

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

export async function createAccount({
	idFieldName,
	idValue,
	profileData,
}: {
	idFieldName: IdentificationKeyName;
	idValue: string;
	profileData: Omit<User, "userID">;
}) {
	const userID = uuidv4();
	const initialSessionID = uuidv4();
	console.log(`Creating account with userID ${userID}, ${idFieldName} ${idValue}`);

	const cmd = new UpdateCommand({
		TableName: "users",
		Key: { userID },
		UpdateExpression: `ADD sessionIDs :newSessionIDs
							SET ${idFieldName} = :idValue,
							email = :email,
							#name = :name,
							picture = :picture`,
		ExpressionAttributeNames: {
			"#name": "name",
		},
		ExpressionAttributeValues: {
			":newSessionIDs": new Set([initialSessionID]),
			":idValue": idValue,
			":email": profileData.email,
			":name": profileData.name,
			":picture": profileData.picture,
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
		ReturnValues: "UPDATED_NEW",
	});
	const res = await ddb.send(cmd);
	if (res?.Attributes?.sessionIDs.size > ALLOWED_LOGINS) {
		removeSessionID({ sessionID: res!.Attributes!.sessionIDs.values().next().value, userID });
	}
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
	console.log(`logging in with ${JSON.stringify({ idFieldName, idValue, rememberMe, profileData, redirect })}`);

	let userID = await getUserID({ idFieldName, idValue });
	let newSessionID: string;
	if (userID) {
		newSessionID = await addNewSessionID({ userID });
	} else {
		({ userID, initialSessionID: newSessionID } = await createAccount({ idFieldName, idValue, profileData }));
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
