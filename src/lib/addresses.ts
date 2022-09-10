export const URLS = {
	ACCOUNT: "/account",
	LOGIN: "/account/login",
	LINK: "/account/link",
	EMAILENDPOINT: "/account/emailendpoint",
};

export const API = {
	ACCOUNT: "account",
	RESTAURANTS: "restaurants",
};

type FieldScope = {
	read?: boolean;
	write?: boolean;
	forced?: boolean;
};

type Scopes = {
	fields: Record<string, FieldScope>;
	actions: Record<string, string>;
};

export const SCOPES: Scopes = {
	fields: {
		userID: {
			read: true,
			forced: true,
		},
		email: {
			read: true,
		},
		picture: {
			read: true,
			write: true,
		},
		name: {
			read: true,
			write: true,
		},
		bio: {
			read: true,
			write: true,
		},
	},
	actions: {
		revoke: "Revoke all logins and API keys",
		delete: "Delete this account irreverseably",
	},
};

export const DEFAULTSCOPES = {
	"userID:read": true,
};
