import adapter from "@sveltejs/adapter-auto";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		postcss: true,
		scss: {
			includePaths: ["src/styles/"],
			renderSync: true,
		},
	}),

	onwarn: (warning, handler) => {
		if (warning.code.startsWith("a11y")) return;
		handler(warning);
	},

	kit: {
		adapter: adapter(),
	},
	onwarn: (warning, handler) => {
		const suppress = ["a11y-", "css-", "unused-"];
		if (suppress.some((s) => warning.code.startsWith(s))) {
			return;
		}
		handler(warning);
	},
};

export default config;
