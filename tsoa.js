import { watch } from "chokidar";
import { readFile } from "fs/promises";
import globAsync from "glob";
import { load as parseYAML } from "js-yaml";
import { generateSpec, getSwaggerOutputPath } from "tsoa";
import { fileURLToPath } from "url";
import { promisify } from "util";
const glob = promisify(globAsync);

const specFile = "openapi.yaml";
const configFile = "tsoa.json";

let [spec, config] = await Promise.all([readFile(specFile).then((f) => parseYAML(f)), readFile(configFile).then((f) => JSON.parse(f))]);

export default async function build_oas() {
	try {
		console.log("building swagger.json...");
		await generateSpec({ ...config.tsoaOptions, spec: { spec } }, config.compilerOptions);
		console.log("built!");
	} catch (e) {
		console.error(e);
	}
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
	const files = (await Promise.all(config.tsoaOptions.controllerPathGlobs.map((p) => glob(p)))).flat();

	watch(files).on("change", (e, path) => {
		console.log(e + " changed");
		build_oas();
	});
	watch(specFile).on("change", async (e, path) => {
		console.log(specFile + " changed");
		spec = parseYAML(await readFile(specFile));
		build_oas();
	});
	build_oas();
}
