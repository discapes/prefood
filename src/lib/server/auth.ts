import { log } from "../util";
import { hash } from "./crypto";
import type { UnserializableUser, User } from "$lib/types";
import { Table } from "./ddb";

export async function getUserData({ sessionToken, userID }: { sessionToken?: string; userID?: string }) {
	log(`Getting user data with userID ${userID} with sessionToken ${sessionToken}`);
	if (sessionToken && userID) {
		const userData = await new Table<UnserializableUser>("users").key("userID").get(userID);
		if (userData && userData.sessionTokens?.has(hash(sessionToken))) {
			log(`user data found`);
			return { ...userData, sessionTokens: [...userData.sessionTokens] } as User;
		} else {
			log(`user data not found or sessionToken incorrect`);
		}
	}
}
