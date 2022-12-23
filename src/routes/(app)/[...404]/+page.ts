import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

// so we can have 404 pages display under the app layout

export const load: PageLoad = async () => {
	throw error(404, "Not Found");
};
