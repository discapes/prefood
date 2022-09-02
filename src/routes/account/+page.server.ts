import type { PageServerLoad } from "./$types";
import { error, type RequestHandler } from "@sveltejs/kit";
import cookie from "cookie";
import { record, z } from "zod";
import { getUserData } from "$lib/server/auth";
import type { User } from "$lib/types";
import { removeSessionToken } from "./lib";

export const prerender = false;
type AuthPair = { sessionToken: string; userID: string };

export const load: PageServerLoad = async ({ locals: { userID, sessionToken } }) => {
	const userData = await getUserData({ sessionToken, userID });

	return {
		userData: <User>userData,
	};
};

const ActionBody = z.object({
	action: z.string(),
	params: z.unknown(),
});

const EditableProfile = z.object({
	name: z.string(),
	picture: z.string(),
});
const EditProfileParams = EditableProfile.partial();

export const POST: RequestHandler = async ({ request, locals: { userID, sessionToken } }) => {
	const { action, params } = ActionBody.parse(await request.json());
	const auth: AuthPair = { userID: userID ?? "", sessionToken: sessionToken ?? "" };
	console.log({ action, params });
	switch (action) {
		case "logout":
			return await logout(auth);
		case "editprofile":
			return await editprofile(auth, EditProfileParams.parse(params));
		default:
			throw error(404);
	}
};

async function logout({ sessionToken, userID }: AuthPair) {
	if (!sessionToken) throw error(400, "sessionToken not specified.");
	if (!userID) throw error(400, "userID not specified.");
	await removeSessionToken({ userID, sessionToken });
	const headers = new Headers();
	headers.append("set-cookie", cookie.serialize("sessionToken", "", { maxAge: 0 }));
	headers.append("set-cookie", cookie.serialize("userID", "", { maxAge: 0 }));
	return new Response("success", { headers });
}

async function editprofile(auth: AuthPair, { picture, name }: z.infer<typeof EditProfileParams>) {
	throw error(500, "TODO");
	return new Response(null);
}
