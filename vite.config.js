import { sveltekit } from "@sveltejs/kit/vite";
import { writeFile } from "fs/promises";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import openapiConfig from "./openapi.config.js";

function swagger(options) {
	const { output, pretty } = options;
	delete options.output;
	delete options.pretty;
	return {
		name: "swagger-jsdoc",
		buildStart: function () {
			const swaggerSpec = swaggerJSDoc(options);
			const swaggerJson = pretty ? JSON.stringify(swaggerSpec, null, "\t") : JSON.stringify(swaggerSpec);
			return writeFile(output, swaggerJson);
		},
	};
}

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), swagger(openapiConfig)],
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
