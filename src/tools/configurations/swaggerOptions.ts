import dotenv from 'dotenv'

import { SwaggerOptions } from 'fastify-swagger'
import { PORT } from '.'

dotenv.config()

export const swaggerOptions: SwaggerOptions = {
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: 'Thream',
      description:
        "Thream's application programming interface to stay close with your friends and communities.",
      version: process.env.npm_package_version
    },
    host: `localhost:${PORT}`,
    basePath: '/',
    tags: [{ name: 'users' }]
  },
  exposeRoute: true
}
