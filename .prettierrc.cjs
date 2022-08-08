module.exports = {
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 150,
	plugins: [require('prettier-plugin-svelte')],
	overrides: [
		{
			files: '*.svelte',
			options: { parser: 'svelte' }
		}
	]
};
