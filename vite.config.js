import { sveltekit } from "@sveltejs/kit/vite";
import build_oas from "./tsoa";
import path from "path";

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit(),
		{
			name: "tsoa",
			buildStart: build_oas,
		},
	],
	build: {
		sourcemap: "inline",
	},
	server: {
		fs: {
			allow: [path.resolve("../kit/packages/kit/src")],
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				loadPaths: ["src/styles/"],
			},
		},
	},
};

export default config;
