import { ddb, Table } from "$lib/server/ddb";
import type { Order } from "../../types/Order";

class OrderService {
	table = new Table<Order>("orders").key("userID", "timestamp").clone();

	async forUser(userID: string): Promise<Order[]> {
		return this.table()
			.reverse()
			.queryItems(ddb`userID = :${userID}`);
	}
	async getSpecific({ userID, timestamp }: { userID: string; timestamp: number }) {
		const res = await this.table().queryItems(ddb`userID = :${userID} and #${"timestamp"} = :${timestamp}`);
		return <Order | undefined>res[0];
	}
}
export default new OrderService();
