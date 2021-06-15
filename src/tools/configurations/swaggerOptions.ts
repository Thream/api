import dotenv from 'dotenv'

import { FastifyDynamicSwaggerOptions } from 'fastify-swagger'

dotenv.config()

export const swaggerOptions: FastifyDynamicSwaggerOptions = {
  routePrefix: '/documentation',
  openapi: {
    info: {
      title: 'Thream',
      description:
        "Thream's application programming interface to stay close with your friends and communities.",
      version: '0.0.0-development'
    },
    tags: [{ name: 'users' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  exposeRoute: true,
  staticCSP: true
}
