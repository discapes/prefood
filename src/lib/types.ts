import type Stripe from "stripe";
import { z } from "zod";

export const IdentificationMethod = z.union([z.literal("githubID"), z.literal("googleID"), z.literal("email")]);
export type IdentificationMethod = z.infer<typeof IdentificationMethod>;

export const LinkParameters = z.object({
	method: IdentificationMethod,
	stateToken: z.string(),
});
export type LinkParameters = z.infer<typeof LinkParameters>;

export const LoginParameters = z.object({
	stateToken: z.string(),
	rememberMe: z.boolean(),
	referer: z.string(),
	method: IdentificationMethod,
});
export type LoginParameters = z.infer<typeof LoginParameters>;

export const TrustedIdentity = z.object({
	methodValue: z.string(),
	methodName: IdentificationMethod,
});
export type TrustedIdentity = z.infer<typeof TrustedIdentity>;

export const AccountCreationData = TrustedIdentity.and(
	z.object({
		email: z.string(),
		name: z.string(),
		picture: z.string(),
	})
);
export type AccountCreationData = z.infer<typeof AccountCreationData>;

export const EmailLoginCode = z.object({
	timestamp: z.number(),
	email: z.string(),
	name: z.string().optional(),
	picture: z.string().optional(),
});
export type EmailLoginCode = z.infer<typeof EmailLoginCode>;

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
	bio?: string;
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
