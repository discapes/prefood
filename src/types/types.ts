type MenuItem = {
	name: string;
	price_cents: number;
	image: string;
};

type Order = {
	restaurant: string;
	userID: number;
	items: MenuItem[];
	timestamp: number;
};

type Restaurant = {
	name: string;
	menu: MenuItem[];
	stars: number;
	reviews: number;
};

type User = {
	id: number;
	name: string;
	email: string;
	picture: string;
	stripeCustomerID: string;
	sessionIDs?: string[];
};
type UnserializableUser = {
	id: number;
	name: string;
	email: string;
	picture: string;
	stripeCustomerID: string;
	sessionIDs?: Set<string>;
};

export type Typify<T> = { [K in keyof T]: Typify<T[K]> };

export type { MenuItem, User, Restaurant, Order, UnserializableUser };
