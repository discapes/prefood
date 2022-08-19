import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DDB_ACCESS_ID, DDB_ACCESS_KEY } from "$env/static/private";
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({
	region: "eu-north-1",
	credentials: {
		accessKeyId: DDB_ACCESS_ID,
		secretAccessKey: DDB_ACCESS_KEY,
	},
});

const marshallOptions = {
	// Whether to automatically convert empty strings, blobs, and sets to `null`.
	convertEmptyValues: true, // false, by default.
	// Whether to remove undefined values while marshalling.
	removeUndefinedValues: true, // false, by default.
	// Whether to convert typeof object to map attribute.
	convertClassInstanceToMap: true, // false, by default.
};

const unmarshallOptions = {
	// Whether to return numbers as a string instead of converting them to native JavaScript numbers.
	wrapNumbers: false, // false, by default.
};

const ddb = DynamoDBDocumentClient.from(ddbClient, { unmarshallOptions, marshallOptions });
const send = ddb.send.bind(ddb);
ddb.send = async function (...args: Array<any>) {
	// @ts-expect-error
	const res = await send(...args);
	if (res.$metadata.httpStatusCode !== 200) throw new Error(`Database operation failed`);
	return res;
};

export default ddb;

type PrimaryKey = string | number | Uint8Array;

export async function getItem(table: string, key: Record<string, PrimaryKey>, proj?: string): Promise<Record<string, unknown> | undefined> {
	const cmd = new GetCommand({
		TableName: table,
		Key: key,
		ProjectionExpression: proj,
	});

	const res = await ddb.send(cmd);
	return res.Item;
}

export async function putItem(table: string, item: Record<string, unknown>, condition?: string): Promise<Record<string, unknown> | undefined> {
	const cmd = new PutCommand({
		TableName: table,
		Item: item,
		ReturnValues: "ALL_OLD",
		ConditionExpression: condition,
	});

	const oldItem = await ddb.send(cmd);
	return oldItem.Attributes;
}

export async function deleteItem(table: string, key: Record<string, PrimaryKey>): Promise<Record<string, unknown> | undefined> {
	const cmd = new DeleteCommand({
		TableName: table,
		Key: key,
		ReturnValues: "ALL_OLD",
	});

	const res = await ddb.send(cmd);
	return res.Attributes;
}
