import type Stripe from "stripe";
import { z } from "zod";

export type PassedSignInState = z.infer<typeof PassedSignInState>;

export const EmailEndpointOptions = z.object({
	rememberMe: z.boolean(),
	referer: z.string(),
	email: z.string(),
});

export const IdentificationKeyName = z.union([z.literal("githubID"), z.literal("googleID"), z.literal("email")]);
export type IdentificationKeyName = z.infer<typeof IdentificationKeyName>;

export const PassedSignInState = z.object({
	state: z.string(),
	rememberMe: z.boolean(),
	referer: z.string(),
	method: IdentificationKeyName,
});

export const Identity = z.object({
	email: z.string(),
	name: z.string(),
	methodValue: z.string(),
	methodName: IdentificationKeyName,
	picture: z.string(),
});
export type Identity = z.infer<typeof Identity>;

export const EmailCode = z.object({
	timestamp: z.number(),
	email: z.string(),
	name: z.string(),
	picture: z.string(),
});

export type MenuItem = {
	name: string;
	price_cents: number;
	image: string;
};

export type Order = {
	restaurantName: string;
	userID: string;
	items: Stripe.LineItem[];
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
	sessionTokens?: string[];
};

export type UnserializableUser = {
	userID: string;
	googleID?: string;
	githubID?: string;
	name: string;
	email: string;
	picture: string;
	stripeCustomerID?: string;
	sessionTokens?: Set<string>;
};

export type SessionMetadata = {
	linkedCID: string;
	userID: string;
	restaurantName: string;
};

export type SignInButtonOptions = {
	rememberMe: boolean;
	referer: string;
};
