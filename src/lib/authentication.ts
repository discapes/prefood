import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { TokenPayload } from 'google-auth-library';
import type { User } from 'src/types/types';
import ddb, { getItem } from './ddb';

export async function authenticate({ sessionID, userID }: { sessionID?: string; userID?: string }) {
	if (sessionID && userID) {
		const userData = <User>await getItem('users', { userID });
		if (userData && userData.sessionIDs.includes(sessionID)) {
			return userData;
		}
	}
}

// doesn't autheticate!
export async function createOrUpdateAccount({ sessionID, userID, payload }: { sessionID: string; userID: string; payload: TokenPayload }) {
	const cmd = new UpdateCommand({
		TableName: 'users',
		Key: { userID },
		UpdateExpression: `SET sessionIDs = list_append(if_not_exists(sessionIDs, :empty_list), :newSessionIDs),
							payload = if_not_exists(payload, :payload),
							email = :email,
							#name = :name,
							picture = :picture`,
		ExpressionAttributeNames: {
			'#name': 'name'
		},
		ExpressionAttributeValues: {
			':newSessionIDs': [sessionID],
			':payload': payload,
			':empty_list': [],
			':email': payload.email,
			':name': payload.name,
			':picture': payload.picture
		}
	});
	return await ddb.send(cmd);
}
