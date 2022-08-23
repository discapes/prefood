import type { Action } from "@sveltejs/kit";

export const prerender = false;

export const POST: Action = async ({ request: req }) => {
	const data = await req.formData().then((fd) => Object.fromEntries(fd.entries()));
	// validate token == email and create account
	console.log(data);
};
