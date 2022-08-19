module.exports = {
	useTabs: true,
	singleQuote: false,
	trailingComma: "es5",
	printWidth: 150,
	plugins: [require("prettier-plugin-svelte")],
	overrides: [
		{
			files: "*.svelte",
			options: { parser: "svelte" },
		},
	],
};
