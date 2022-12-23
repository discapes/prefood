import { z, ZodError } from "zod";
import type { Order } from "./types/Order";
export { nanoid as uuid } from "nanoid";

export type Modify<T, R> = Omit<T, keyof R> & R;

export function getDataURL(file: File | undefined): Promise<string> {
	return new Promise((res) => {
		if (!file) return res("");
		const fr = new FileReader();
		fr.onload = () => {
			res(fr.result?.toString() || "");
		};
		fr.readAsDataURL(file);
	});
}

export function assert(x: unknown): asserts x {
	if (!x) throw new Error("AssertError");
}

export async function formEntries(request: Request) {
	const fields: Record<string, string | undefined> = Object.create(null);
	const files: Record<string, File | undefined> = Object.create(null);

	for (const [key, value] of await request.formData()) {
		if (typeof value === "string") {
			fields[key] = value;
		} else {
			files[key] = value;
		}
	}
	return { fields, files };
}

export function getDecoder<T extends z.ZodTypeAny>(Type: T) {
	return z.preprocess((a: unknown) => typeof a === "string" && JSON.parse(decodeB64URL(a)), Type);
}
export function getEncoder<T extends z.ZodTypeAny>(Type: T) {
	return {
		encode(a: z.infer<typeof Type>) {
			return encodeB64URL(JSON.stringify(a));
		},
	};
}

export function shuffle<T>(array: T[]) {
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

export function encodeB64URL(str: string) {
	return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeB64URL(input: string) {
	// Replace non-url compatible chars with base64 standard chars
	input = input.replace(/-/g, "+").replace(/_/g, "/");

	// Pad out with standard base64 required padding characters
	const pad = input.length % 4;
	if (pad) {
		if (pad === 1) {
			throw new Error("InvalidLengthError: Input base64url string is the wrong length to determine padding");
		}
		input += new Array(5 - pad).join("=");
	}

	return atob(input);
}

export function getSlugFromOrder(order: Order) {
	return btoa(order.userID) + "-" + order.timestamp;
}

export function log(message: unknown, obj?: unknown) {
	console.log(message + (obj !== undefined ? " - " + JSON.stringify(obj) : ""));
}

export function cerror(message: string) {
	console.error(message);
	throw new Error(message);
}

export function loadScript(url: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = url;
		const headOrBody = document.head || document.body;
		headOrBody.appendChild(script);

		script.addEventListener("load", () => {
			if (window.google) {
				resolve();
			} else {
				reject(new Error("Script is not available"));
			}
		});

		script.addEventListener("error", () => {
			reject(new Error("Failed to load script"));
		});
	});
}

export function falsePropNames(obj: any) {
	const undef = Object.keys(obj).filter((k) => !obj[k]);
	return undef;
}

export function getCookie(name: string) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop()!.split(";").shift();
}

export function getDataFromOrderSlug(slug: string) {
	return {
		userID: atob(slug.slice(0, slug.indexOf("-"))),
		timestamp: +slug.slice(slug.indexOf("-") + 1),
	};
}

export function formatHHMMSS(date: Date) {
	const hh = date.getHours();
	const mm = date.getMinutes();
	const ss = date.getSeconds();
	return [hh, mm, ss].map((n) => String(n).padStart(2, "0")).join(":");
}

export function randomElem<T>(array: T[]) {
	return array[Math.floor(Math.random() * array.length)];
}

export function trueStrings(args: unknown[]): args is string[] {
	return args.every((s) => s && typeof s === "string");
}

export function hook(o: any, fname: string, mine: any) {
	const og = o[fname].bind(o);
	o[fname] = () => {
		mine();
		og();
	};
}

export function capitalize<T extends string>(str: T): Capitalize<T> {
	return <Capitalize<T>>(str.charAt(0).toUpperCase() + str.slice(1));
}

export function isObject(o: unknown): o is Record<string, unknown> {
	return (typeof o === "object" && o !== null) || typeof o === "function";
}

export function asRecord(o: unknown): Record<string, unknown> | undefined {
	if ((typeof o === "object" && o !== null) || typeof o === "function") return o as any;
	else {
		return undefined;
	}
}

export function zerrorMessage(e: ZodError) {
	return `Invalid entries:\n\t${e.issues.map((i) => i.path + `: ` + i.message).join(",\n\t")}`;
}

export function formFrom(o: Record<string, string | Blob>) {
	const fd = new FormData();
	Object.entries(o).map(([k, v]) => {
		fd.append(k, v);
	});
	return fd;
}

/**
 * sends a request to the specified url from a form. this will change the window location.
 * param {string} path the path to send the post request to
 * param {object} params the parameters to add to the url
 * param {string} [method=post] the method to use on the form
 */

export function post(path: string, params: Record<string, string>, method = "post") {
	// The rest of this code assumes you are not using a library.
	// It can be made less verbose if you use one.
	const form = document.createElement("form");
	form.method = method;
	form.action = path;

	for (const key in params) {
		const hiddenField = document.createElement("input");
		hiddenField.type = "hidden";
		hiddenField.name = key;
		hiddenField.value = params[key];

		form.appendChild(hiddenField);
	}

	document.body.appendChild(form);
	form.submit();
}

export function inputValidator(node: HTMLInputElement, _val: any) {
	let check = false;
	return {
		update(val: any) {
			if (check == false && val) check = true;
			else if (check) {
				node.style.outlineColor = val ? "" : "red";
				node.style.outlineStyle = val ? "" : "solid";
			}
		},
	};
}

export function cli(i: HTMLInputElement, h: (value: string) => void) {
	const okd = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			const val = i.value;
			i.value = "";
			h(val);
		}
	};
	i.addEventListener("keydown", okd);
	return {
		destroy() {
			i.removeEventListener("keydown", okd);
		},
	};
}

export function numberValidator(node: HTMLInputElement, val: any) {
	let check = false;
	const initial = val;
	return {
		update(val: any) {
			if (check == false && val !== initial) check = true;
			if (check) {
				const good = typeof val == "number";
				node.style.outlineColor = good ? "" : "red";
				node.style.outlineStyle = good ? "" : "solid";
			}
		},
	};
}

export function firstTrue<T>(promises: Array<Promise<T>>) {
	const newPromises = promises.map((p) => new Promise((resolve, reject) => p.then((v) => v && resolve(v), reject)));
	newPromises.push(Promise.all(promises).then(() => false));
	return <Promise<T>>Promise.race(newPromises);
}

export function removeElem<T>(arr: T[], elem: T) {
	const i = arr.findIndex((e) => e === elem);
	if (~i) arr.splice(i, 1);
}

let dialogs: HTMLDivElement[] = [];
export function dialog(text: string, duration: number, fadeduration: number) {
	const div = document.createElement("div");
	if (dialogs.length >= 10) dialogs = (dialogs.forEach((div) => div.remove()), []);
	const other = dialogs.at(-1);
	const offset = other ? other.offsetTop + other.offsetHeight + 10 : 10;
	dialogs.push(div);
	div.style.top = offset + "px";
	div.style.right = "10px";
	div.innerText = text;
	div.classList.add("dialog");
	document.body.appendChild(div);
	setTimeout(() => (div.style.animation = `fade-out ${fadeduration}s`), duration * 1000);
	setTimeout(() => {
		removeElem(dialogs, div);
		div.remove();
	}, (duration + fadeduration) * 1000);
}
