import { readFile, writeFile } from "fs/promises";
import swaggerJSDoc from "swagger-jsdoc";
import { watch } from "chokidar";
import globAsync from "glob";
import { promisify } from "util";
const glob = promisify(globAsync);
import { load as parseYAML } from "js-yaml";
import { fileURLToPath } from "url";

const input = "openapi.yaml";
const output = "static/swagger.json";
const pretty = true;
const apis = ["src/routes/**/+server.ts"];
let definition = parseYAML(await readFile(input));

const swaggerOptions = {
	definition,
	apis,
};

export default function build_oas() {
	try {
		const swaggerSpec = swaggerJSDoc(swaggerOptions);
		const swaggerJson = pretty ? JSON.stringify(swaggerSpec, null, "\t") : JSON.stringify(swaggerSpec);
		return writeFile(output, swaggerJson);
	} catch (e) {
		console.error(e);
	}
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
	const files = await glob(apis[0]);

	watch(files).on("change", (e, path) => {
		console.log(e + " changed, building...");
		build_oas();
	});
	watch(input).on("change", async (e, path) => {
		console.log(input + " changed, building...");
		definition = parseYAML(await readFile(input));
		build_oas();
	});
	console.log("building...");
	build_oas();
}
