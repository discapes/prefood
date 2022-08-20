export type MenuItem = {
	name: string;
	price_cents: number;
	image: string;
};

export type Order = {
	restaurantName: string;
	userID: string;
	items: MenuItem[];
	timestamp: number;
};

export type Restaurant = {
	name: string;
	menu: MenuItem[];
	stars: number;
	reviews: number;
};

export type User = {
	userID: string;
	googleID?: string;
	githubID?: string;
	name: string;
	email: string;
	picture: string;
	stripeCustomerID?: string;
	sessionIDs?: string[];
};

export type UnserializableUser = {
	userID: string;
	googleID?: string;
	githubID?: string;
	name: string;
	email: string;
	picture: string;
	stripeCustomerID?: string;
	sessionIDs?: Set<string>;
};

export type SessionMetadata = {
	userID: string;
	restaurantName: string;
	itemsJSON: string;
};
