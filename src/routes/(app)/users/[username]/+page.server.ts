import { API } from "$lib/addresses";
import { ddb, Table } from "$lib/server/ddb";
import AccountService from "$lib/services/AccountService";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
	const user = await AccountService.getPublicDataByUsername(params.username);

	return {
		user,
	};
};
