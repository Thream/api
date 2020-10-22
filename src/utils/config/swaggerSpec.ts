import swaggerJsDoc from 'swagger-jsdoc'

// Extended: https://swagger.io/specification/#infoObject
export const swaggerSpec = swaggerJsDoc({
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: "Thream's API",
      description:
        'Stay close with your friends and communities, talk, chat, collaborate, share, and have fun.',
      version: '0.0.1'
    },
    basePath: '/',
    host: process.env.API_BASE_URL,
    tags: [{ name: 'users' }, { name: 'guilds' }, { name: 'channels' }]
  },
  apis: ['./docs/**/*.yaml']
})
