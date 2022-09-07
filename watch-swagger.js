import { writeFile } from "fs/promises";
import swaggerJSDoc from "swagger-jsdoc";
import { watch } from "chokidar";
import globAsync from "glob";
import { promisify } from "util";
const glob = promisify(globAsync);
import options from "./openapi.config.js";

const { output, pretty } = options;
delete options.output;
delete options.pretty;

const files = await glob("src/routes/**/*server.ts");

watch(files, options).on("change", (e, path) => {
	console.log("build");
	const swaggerSpec = swaggerJSDoc(options);
	const swaggerJson = pretty ? JSON.stringify(swaggerSpec, null, "\t") : JSON.stringify(swaggerSpec);
	writeFile(output, swaggerJson);
});
