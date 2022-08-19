import ddb from "$lib/ddb.js";
import type { PageServerLoad } from "./$types";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { error } from "@sveltejs/kit";
import type { Restaurant } from "src/types/types";

// return {
// 	cahce: "no cache, invalidate this manually and refresh? or do swr?"??;
// }

export const prerender = false;

export const load: PageServerLoad = async () => {
	const command = new ScanCommand({ TableName: "restaurants" });
	const res = await ddb.send(command);
	if (!res || !res.Items) throw error(500, `restaurants not found`);

	return {
		restaurants: res.Items as Restaurant[],
	};
};