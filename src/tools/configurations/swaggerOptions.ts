import dotenv from 'dotenv'
import { readPackage } from 'read-pkg'
import { FastifyDynamicSwaggerOptions } from 'fastify-swagger'

dotenv.config()

const packageJSON = await readPackage()

export const swaggerOptions: FastifyDynamicSwaggerOptions = {
  routePrefix: '/documentation',
  openapi: {
    info: {
      title: packageJSON.name,
      description: packageJSON.description,
      version: packageJSON.version
    },
    tags: [
      { name: 'users' },
      { name: 'guilds' },
      { name: 'channels' },
      { name: 'messages' },
      { name: 'members' },
      { name: 'uploads' }
    ],
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
  staticCSP: true,
  hideUntagged: true
}
