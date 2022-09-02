import { ENCRYPTION_KEY_HEX_32 } from "$env/static/private";
import { createCipheriv, randomBytes, createDecipheriv, createHash } from "crypto";
import { z } from "zod";

const key = Buffer.from(ENCRYPTION_KEY_HEX_32, "hex");
const alg = "aes256";

export function encrypt(msg: string) {
	const iv = randomBytes(16);
	const cipher = createCipheriv(alg, key, iv);
	return iv.toString("hex") + "-" + cipher.update(msg, "utf8", "hex") + cipher.final("hex");
}

export function decrypt(msg: string) {
	const iv = Buffer.from(msg.slice(0, msg.indexOf("-")), "hex");
	const ct = msg.slice(msg.indexOf("-") + 1);
	const cipher = createDecipheriv(alg, key, iv);
	return cipher.update(ct, "hex", "utf-8") + cipher.final("utf8");
}

export function hash(str: string) {
	return createHash("sha256").update(str).digest("hex");
}

export function getDecoderCrypt<T extends z.ZodTypeAny>(Type: T) {
	return z.preprocess((a: unknown) => typeof a === "string" && JSON.parse(decrypt(a)), Type);
}
export function getEncoderCrypt<T extends z.ZodTypeAny>(Type: T) {
	return {
		encode(a: z.infer<typeof Type>) {
			return encrypt(JSON.stringify(a));
		},
	};
}
