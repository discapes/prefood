const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Hello World",
			version: "1.0.0",
		},
	},
	apis: ["./src/routes/**/*.ts"], // files containing annotations as above
};

const openapiSpecification = swaggerJsdoc(options);

console.log(JSON.stringify(openapiSpecification, null, 2));
