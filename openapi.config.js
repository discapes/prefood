const OAS = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Hello Worlds",
			version: "1.0.0",
		},
	},
	apis: ["src/routes/**/*.ts"],
	pretty: true,
	output: "static/swagger.json",
};

export default OAS;
