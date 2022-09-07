import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DDB_REGION, DDB_ACCESS_ID, DDB_ACCESS_KEY } from "$env/static/private";
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({
	region: DDB_REGION,
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

type PrimaryKey = string | number | Uint8Array;

export class Condition {
	str: string;

	constructor(str: string) {
		this.str = str;
	}

	toString() {
		return `( ${this.str} )`;
	}

	or(c: Condition) {
		this.str += " OR " + c;
	}
	and(c: Condition) {
		this.str += " AND " + c;
	}
	not() {
		this.str = "NOT " + this.str;
	}
}

export class Table<T extends {}> {
	#table: string;
	#condition?: Condition;
	#key?: string;
	#project?: string;

	constructor(name: string) {
		this.#table = name;
	}
	key(keyName: string) {
		this.#key = keyName;
		return this;
	}
	condition(condition: Condition) {
		this.#condition = condition;
		return this;
	}
	async scan(): Promise<T[]> {
		const command = new ScanCommand({ TableName: "restaurants" });
		const res = await ddb.send(command);
		if (!res.Items) throw new Error("Items not found");
		return <T[]>res.Items;
	}
	project(attributes: string[]) {
		this.#project = attributes.join(",");
	}
	async get(keyValue: string) {
		if (!this.#key) throw new Error("key not specified");
		const cmd = new GetCommand({
			TableName: this.#table,
			Key: { [this.#key]: keyValue },
			ProjectionExpression: this.#project,
		});
		const res = await ddb.send(cmd);
		return <T>res.Item;
	}
	async put(item: T) {
		const cmd = new PutCommand({
			TableName: this.#table,
			Item: item,
			ConditionExpression: this.#condition?.toString(),
		});
		const res = await ddb.send(cmd);
	}
	async delete(keyValue: string) {
		if (!this.#key) throw new Error("key not specified");
		const cmd = new DeleteCommand({
			TableName: this.#table,
			Key: { [this.#key]: keyValue },
		});
		const res = await ddb.send(cmd);
	}
}
