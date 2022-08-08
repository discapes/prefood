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
	sessionIDs: string[];
};

export type { MenuItem, User, Restaurant, Order };
