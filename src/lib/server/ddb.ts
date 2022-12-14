import { AWS_ACCESS_ID, AWS_ACCESS_KEY_MY, AWS_REGION_MY } from "$env/static/private";
import { asRecord } from "$lib/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({
	region: AWS_REGION_MY,
	credentials: {
		accessKeyId: AWS_ACCESS_ID,
		secretAccessKey: AWS_ACCESS_KEY_MY,
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
const verbose = true;
dynamo.send = async function (...args: Array<any>) {
	const name = args[0].constructor.name;
	if (verbose || name !== "GetCommand") console.log(name, args[0]?.clientCommand?.input);
	// @ts-expect-error any
	const res = <any>await send(...args);
	if (verbose || (name !== "UpdateCommand" && name !== "GetCommand")) console.log(name + " ->", res.Item || res.Items || res.$metadata);
	if (res.$metadata.httpStatusCode !== 200) throw new Error(`Database operation failed`);
	return res;
};

type KeyValue = string | number | Uint8Array;

export type Expression = {
	str: string;
	values: unknown[];
	names: string[];
};

/* for example expression`f(#${foo}) ${"<"} :${bar}`
	returns {
		str: 'f(#) < :`
		names: ["foo"]
		values: ["bar"]
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
						return s;
					case ":":
						values.push(params[i]);
						return s;
					default:
						return s + (params[i] ?? "");
				}
			})
			.join(""),
		values,
		names,
	};
}

export class Table<T extends object> {
	_table: string;
	_condition?: string;
	_key?: string;
	_sk?: string;
	_project?: string;
	_index?: string;
	_reverse = false;
	_names = Array<string>();
	_values = Array<unknown>();
	_returnValues?: string;
	_updateExpressions = new Map<string, string[]>();

	constructor(name: string) {
		this._table = name;
	}
	clone() {
		return this.#clone.bind(this);
	}
	#clone(): Table<T> {
		const other = new Table<T>(this._table);
		for (const key in this) {
			if (!asRecord(this[key])) (<any>other)[key] = this[key];
		}
		return other;
	}
	key(keyName: string, skName?: string) {
		this._key = keyName;
		this._sk = skName;
		return this;
	}
	#mergeExpression(e: Expression) {
		// we could do this
		let str = e.str;
		let nNames = this._names.length;
		let nValues = this._values.length;
		str = str.replace(/#/g, () => "#" + "a".repeat(++nNames));
		str = str.replace(/:/g, () => ":" + "a".repeat(++nValues));
		this._names.push(...e.names);
		this._values.push(...e.values);
		return str;
	}
	#update(type: string, e: Expression) {
		const arr = this._updateExpressions.get(type) ?? [];
		arr.push(this.#mergeExpression(e));
		this._updateExpressions.set(type, arr);
		return this;
	}
	#getAttributeValues() {
		if (!this._values.length) return undefined;
		return Object.fromEntries(this._values.map((v, i) => [":" + "a".repeat(i + 1), v]));
	}
	#getAttributeNames() {
		if (!this._names.length) return undefined;
		return Object.fromEntries(this._names.map((v, i) => ["#" + "a".repeat(i + 1), v]));
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
	remove(e: Expression) {
		return this.#update("REMOVE", e);
	}
	return(rv: string) {
		this._returnValues = rv;
		return this;
	}
	condition(condition: Expression) {
		this._condition = this.#mergeExpression(condition);
		return this;
	}
	and(condition: Expression) {
		if (!this._condition) return this.condition(condition);
		this._condition = `(${this._condition}) AND (${this.#mergeExpression(condition)})`;
		return this;
	}
	or(condition: Expression) {
		if (!this._condition) return this.condition(condition);
		this._condition = `(${this._condition}) OR (${this.#mergeExpression(condition)})`;
		return this;
	}
	not() {
		if (!this._condition) throw new Error("Cannot be called before conditions");
		this._condition = `NOT (${this._condition})`;
		return this;
	}
	reverse() {
		this._reverse = !this._reverse;
		return this;
	}
	index(name: string) {
		this._index = name;
		return this;
	}
	project(attributes: string[]) {
		this._project = attributes.join(",");
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
	async getItem(keyValue: KeyValue, skValue?: KeyValue): Promise<T | undefined> {
		if (!this._key) throw new Error("key not specified");
		const Key = { [this._key]: keyValue };
		if (skValue && this._sk) Key[this._sk] = skValue;
		const cmd = new GetCommand({
			TableName: this._table,
			Key,
			ProjectionExpression: this._project,
		});
		const res = await dynamo.send(cmd);
		return <T | undefined>res.Item;
	}
	async putItem(item: T) {
		const cmd = new PutCommand({
			TableName: this._table,
			Item: item,
			ConditionExpression: this._condition,
			ExpressionAttributeNames: this.#getAttributeNames(),
			ExpressionAttributeValues: this.#getAttributeValues(),
			ReturnValues: this._returnValues,
		});
		const res = await dynamo.send(cmd);
		return res.Attributes;
	}
	async deleteItem(keyValue: KeyValue) {
		if (!this._key) throw new Error("key not specified");
		const cmd = new DeleteCommand({
			TableName: this._table,
			Key: { [this._key]: keyValue },
			ConditionExpression: this._condition,
			ExpressionAttributeNames: this.#getAttributeNames(),
			ExpressionAttributeValues: this.#getAttributeValues(),
			ReturnValues: this._returnValues,
		});
		const res = await dynamo.send(cmd);
		return res.Attributes;
	}
	async updateItem(keyValue: KeyValue) {
		if (!this._key) throw new Error("key not specified");
		const cmd = new UpdateCommand({
			TableName: this._table,
			Key: { [this._key]: keyValue },
			UpdateExpression: [...this._updateExpressions.entries()].map(([type, v]) => `${type} ${v.join(", ")}`).join(" "),
			ConditionExpression: this._condition,
			ExpressionAttributeNames: this.#getAttributeNames(),
			ExpressionAttributeValues: this.#getAttributeValues(),
			ReturnValues: this._returnValues,
		});
		const res = await dynamo.send(cmd);
		return res.Attributes;
	}
	async queryItems(keyCondition: Expression): Promise<T[]> {
		const kc = this.#mergeExpression(keyCondition);
		if (!this._key) throw new Error("key not specified");
		const cmd = new QueryCommand({
			TableName: this._table,
			KeyConditionExpression: kc,
			IndexName: this._index,
			ExpressionAttributeNames: this.#getAttributeNames(),
			ExpressionAttributeValues: this.#getAttributeValues(),
			ScanIndexForward: !this._reverse,
		});
		const res = await dynamo.send(cmd);
		if (!res.Items) throw new Error("items not found");
		return <T[]>res.Items;
	}
}
