import { UnserializableUser, User } from "$lib/types";
import { getItem } from "./ddb";
import { log } from "../util";
import { hash } from "./crypto";

export async function getUserData({ sessionToken, userID }: { sessionToken?: string; userID?: string }) {
	log(`Getting user data with userID ${userID} with sessionToken ${sessionToken}`);
	if (sessionToken && userID) {
		const userData = <UnserializableUser>await getItem("users", { userID });
		if (userData && userData.sessionTokens?.has(hash(sessionToken))) {
			log(`user data found`);
			return { ...userData, sessionTokens: [...userData.sessionTokens] } as User;
		} else {
			log(`user data not found or sessionToken incorrect`);
		}
	}
}
