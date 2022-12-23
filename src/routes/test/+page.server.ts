import { REDIS_ENDPOINT } from "$env/static/private";
import { formEntries } from "$lib/util";
import { createClient } from "@redis/client";
import type { Actions } from "./$types";

export const actions: Actions = {
	async default({ request }) {
		return "disabled";
		// const {
		// 	fields: { command },
		// } = await formEntries(request);
		// if (!command) return;

		// const client = createClient({
		// 	url: `rediss://${REDIS_ENDPOINT}`,
		// });
		// client.on("error", (err) => console.log("Redis client error:", err));
		// await client.connect();
		// const res = await client.sendCommand(command.split(" "));

		// return res;
	},
};
