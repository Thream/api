import dotenv from 'dotenv'
import readPackageJSON from 'read-pkg'
import { FastifyDynamicSwaggerOptions } from 'fastify-swagger'

dotenv.config()

const packageJSON = readPackageJSON.sync()

export const swaggerOptions: FastifyDynamicSwaggerOptions = {
  routePrefix: '/documentation',
  openapi: {
    info: {
      title: 'Thream',
      description: packageJSON.description,
      version: packageJSON.version
    },
    tags: [
      { name: 'users' },
      { name: 'guilds' },
      { name: 'channels' },
      { name: 'messages' },
      { name: 'members' }
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
