import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { DDB_ACCESS_ID, DDB_ACCESS_KEY } from '$env/static/private';

const ddb = new DynamoDBClient({
	region: 'eu-north-1',
	credentials: {
		accessKeyId: DDB_ACCESS_ID,
		secretAccessKey: DDB_ACCESS_KEY
	}
});

export default ddb;

export async function getItem(table: string, key: Record<string, string>, proj?: string) {
	const cmd = new GetItemCommand({
		TableName: table,
		Key: marshall(key),
		ProjectionExpression: proj
	});

	const res = await ddb.send(cmd);
	return res.Item ? unmarshall(res.Item) : undefined;
}
