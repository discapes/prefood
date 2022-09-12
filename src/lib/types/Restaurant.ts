export type MenuItem = {
	name: string;
	price_cents: number;
	image: string;
};

export type Restaurant = {
	name: string;
	menu: MenuItem[];
	stars: number;
	reviews: number;
};
