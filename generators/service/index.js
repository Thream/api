/** @type {import('node-plop').PlopGeneratorConfig} */
export const serviceGenerator = {
  description: "REST API endpoint",
  prompts: [
    {
      type: "input",
      name: "url",
      message: "url",
    },
    {
      type: "list",
      name: "httpMethod",
      message: "httpMethod",
      choices: ["GET", "POST", "PUT", "DELETE"],
    },
    {
      type: "input",
      name: "description",
      message: "description",
    },
    {
      type: "list",
      name: "tag",
      message: "tag",
      choices: ["users", "oauth2", "guilds", "channels", "messages", "members"],
    },
    {
      type: "confirm",
      name: "shouldBeAuthenticated",
      message: "shouldBeAuthenticated",
    },
  ],
  actions: [
    {
      type: "add",
      path: "src/services/{{url}}/{{lowerCase httpMethod}}.ts",
      templateFile: "generators/service/service.ts.hbs",
    },
    {
      type: "add",
      path: "src/services/{{url}}/__test__/{{lowerCase httpMethod}}.test.ts",
      templateFile: "generators/service/service.test.ts.hbs",
    },
  ],
}
