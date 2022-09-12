import { z } from "zod";

export const IdentificationMethod = z.union([z.literal("githubID"), z.literal("googleID"), z.literal("email")]);

export const LinkParameters = z.object({
	method: IdentificationMethod,
	type: z.literal("link"),
	stateToken: z.string(),
});

export const LoginParameters = z.object({
	stateToken: z.string(),
	rememberMe: z.boolean(),
	referer: z.string(),
	method: IdentificationMethod,
	type: z.literal("login"),
});

export const StateParameters = LoginParameters.or(LinkParameters);

export const TrustedIdentity = z.object({
	methodValue: z.string(),
	methodName: IdentificationMethod,
});

export const AccountCreationData = TrustedIdentity.and(
	z.object({
		email: z.string(),
		name: z.string(),
		picture: z.string(),
	})
);

export const EmailLoginCode = z.object({
	timestamp: z.number(),
	email: z.string(),
	name: z.string().optional(),
	picture: z.string().optional(),
});

export type SessionMetadata = {
	linkedCID: string;
	userID: string;
	restaurantName: string;
};

export type IdentificationMethod = z.infer<typeof IdentificationMethod>;
export type LinkParameters = z.infer<typeof LinkParameters>;
export type LoginParameters = z.infer<typeof LoginParameters>;
export type TrustedIdentity = z.infer<typeof TrustedIdentity>;
export type AccountCreationData = z.infer<typeof AccountCreationData>;
export type EmailLoginCode = z.infer<typeof EmailLoginCode>;
export type StateParameters = z.infer<typeof StateParameters>;
