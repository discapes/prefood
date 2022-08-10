import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { TokenPayload } from 'google-auth-library';
import type { User } from 'src/types/types';
import ddb, { getItem } from './ddb';

export async function authenticate({ sessionID, userID }: { sessionID?: string; userID?: string }) {
	if (sessionID && userID) {
		const userData = <User>await getItem('users', { userID });
		if (userData && userData.sessionIDs?.has(sessionID)) {
			return userData;
		}
	}
}

// doesn't autheticate!
export async function createOrUpdateAccount({ sessionID, userID, payload }: { sessionID: string; userID: string; payload: TokenPayload }) {
	const cmd = new UpdateCommand({
		TableName: 'users',
		Key: { userID },
		UpdateExpression: `ADD sessionIDs :newSessionIDs
							SET	payload = :payload,
							email = :email,
							#name = :name,
							picture = :picture`,
		ExpressionAttributeNames: {
			'#name': 'name'
		},
		ExpressionAttributeValues: {
			':newSessionIDs': new Set([sessionID]),
			':payload': payload,
			':email': payload.email,
			':name': payload.name,
			':picture': payload.picture
		},
		ReturnValues: 'UPDATED_NEW'
	});
	const res = await ddb.send(cmd);
	if (res?.Attributes?.sessionIDs.size > 3) {
		removeSessionID({ sessionID: res!.Attributes!.sessionIDs.values().next(), userID });
	}
	return res;
}

// doesn't autheticate!
export async function removeSessionID({ sessionID, userID }: { sessionID: string; userID: string }) {
	const cmd = new UpdateCommand({
		TableName: 'users',
		Key: { userID },
		UpdateExpression: `DELETE sessionIDs :delSessionID`,
		ExpressionAttributeValues: {
			':delSessionID': new Set([sessionID])
		}
	});
	return await ddb.send(cmd);
}
