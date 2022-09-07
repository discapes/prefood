import { sveltekit } from "@sveltejs/kit/vite";
import build_oas from "./swagger";
import path from "path";

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit(),
		{
			name: "swagger-jsdoc",
			buildStart: build_oas,
		},
	],
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
