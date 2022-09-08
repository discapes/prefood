import { DDB_ACCESS_ID, DDB_ACCESS_KEY, DDB_REGION } from "$env/static/private";
import { isObject } from "$lib/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	DeleteCommand,
	DynamoDBDocumentClient,
	GetCommand,
	PutCommand,
	QueryCommand,
	ScanCommand,
	UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({
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

const dynamo = DynamoDBDocumentClient.from(dynamoClient, {
	unmarshallOptions,
	marshallOptions,
});
const send = dynamo.send.bind(dynamo);
dynamo.send = async function (...args: Array<any>) {
	// @ts-expect-error
	const res = await send(...args);
	if (res.$metadata.httpStatusCode !== 200) throw new Error(`Database operation failed`);
	return res;
};

type KeyValue = string | number | Uint8Array;

type Expression = {
	str: string;
	values: unknown[];
	names: string[];
};

const NAMECHAR = "$";
const VALUECHAR = "~";

/* for example expression`f(#${foo}) ${"<"} :${bar}`
	returns {
		str: 'f(#) < :`
		names: [<foo>]
		values: [<bar>]
	} */
export function ddb(strs: TemplateStringsArray, ...params: unknown[]): Expression {
	const values = Array<unknown>();
	const names = Array<string>();
	return {
		str: Array(...strs)
			.map((s, i) => {
				switch (s.at(-1)) {
					case "#":
						names.push(String(params[i]));
						return s + NAMECHAR;
					case ":":
						values.push(params[i]);
						return s + VALUECHAR;
					default:
						return s + (params[i] ?? "");
				}
			})
			.join(""),
		values,
		names,
	};
}

export class Table<T extends {}> {
	#table: string;
	#condition?: string;
	#key?: string;
	#sk?: string;
	#project?: string;
	#index?: string;
	#reverse = false;
	#names = Array<string>();
	#values = Array<unknown>();
	#updateExpressions = new Map<string, string[]>();

	constructor(name: string) {
		this.#table = name;
	}
	clone() {
		return this.#clone.bind(this);
	}
	#clone(): Table<T> {
		const other = new Table<T>(this.#table);
		for (const key in this) {
			if (!isObject(this[key])) (<any>other)[key] = this[key];
		}
		return other;
	}
	key(keyName: string, skName?: string) {
		this.#key = keyName;
		this.#sk = skName;
		return this;
	}
	#mergeExpression(e: Expression) {
		// we could do this
		let nNames = this.#names.length;
		let nValues = this.#values.length;
		e.str.replace(NAMECHAR, () => "a".repeat(++nNames));
		e.str.replace(VALUECHAR, () => "a".repeat(++nValues));
		this.#names.push(...e.names);
		this.#values.push(...e.values);
		return e.str;
	}
	#update(type: string, e: Expression) {
		const arr = this.#updateExpressions.get(type) ?? [];
		arr.push(this.#mergeExpression(e));
		this.#updateExpressions.set(type, arr);
		return this;
	}
	#getAttributeValues() {
		return Object.fromEntries(this.#values.map((v, i) => [":" + "a".repeat(i + 1), v]));
	}
	#getAttributeNames() {
		return Object.fromEntries(this.#names.map((v, i) => ["#" + "a".repeat(i + 1), v]));
	}
	delete(e: Expression) {
		return this.#update("DELETE", e);
	}
	add(e: Expression) {
		return this.#update("ADD", e);
	}
	set(e: Expression) {
		return this.#update("SET", e);
	}
	condition(condition: Expression) {
		this.#condition = this.#mergeExpression(condition);
		return this;
	}
	reverse() {
		this.#reverse = !this.#reverse;
		return this;
	}
	index(name: string) {
		this.#index = name;
		return this;
	}
	project(attributes: string[]) {
		this.#project = attributes.join(",");
		return this;
	}
	async scanItems(): Promise<T[]> {
		const command = new ScanCommand({
			TableName: "restaurants",
			ExpressionAttributeNames: this.#getAttributeNames(),
			ExpressionAttributeValues: this.#getAttributeValues(),
		});
		const res = await dynamo.send(command);
		if (!res.Items) throw new Error("Items not found");
		return <T[]>res.Items;
	}
	async getItem(keyValue: KeyValue): Promise<T | undefined> {
		if (!this.#key) throw new Error("key not specified");
		const cmd = new GetCommand({
			TableName: this.#table,
			Key: { [this.#key]: keyValue },
			ProjectionExpression: this.#project,
		});
		const res = await dynamo.send(cmd);
		return <T | undefined>res.Item;
	}
	async putItem(item: T) {
		const cmd = new PutCommand({
			TableName: this.#table,
			Item: item,
			ConditionExpression: this.#condition?.toString(),
			ExpressionAttributeNames: this.#getAttributeNames(),
			ExpressionAttributeValues: this.#getAttributeValues(),
		});
		const res = await dynamo.send(cmd);
	}
	async deleteItem(keyValue: KeyValue) {
		if (!this.#key) throw new Error("key not specified");
		const cmd = new DeleteCommand({
			TableName: this.#table,
			Key: { [this.#key]: keyValue },
			ExpressionAttributeNames: this.#getAttributeNames(),
			ExpressionAttributeValues: this.#getAttributeValues(),
		});
		const res = await dynamo.send(cmd);
	}
	async updateItem(keyValue: KeyValue) {
		if (!this.#key) throw new Error("key not specified");
		const cmd = new UpdateCommand({
			TableName: this.#table,
			Key: { [this.#key]: keyValue },
			UpdateExpression: Array(this.#updateExpressions.entries())
				.map(([type, v]) => `${type} ${v.join(", ")}`)
				.join(" "),
			ExpressionAttributeNames: this.#getAttributeNames(),
			ExpressionAttributeValues: this.#getAttributeValues(),
		});
		await dynamo.send(cmd);
	}
	async queryItems(keyCondition: Expression): Promise<T[]> {
		const kc = this.#mergeExpression(keyCondition);
		if (!this.#key) throw new Error("key not specified");
		const cmd = new QueryCommand({
			TableName: this.#table,
			KeyConditionExpression: kc,
			IndexName: this.#index,
			ExpressionAttributeNames: this.#getAttributeNames(),
			ExpressionAttributeValues: this.#getAttributeValues(),
			ScanIndexForward: !this.#reverse,
		});
		const res = await dynamo.send(cmd);
		if (!res.Items) throw new Error("items not found");
		return <T[]>res.Items;
	}
}
