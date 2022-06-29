import dotenv from 'dotenv'
import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifySensible from '@fastify/sensible'

import { services } from './services/index.js'
import { swaggerOptions } from './tools/configurations/swaggerOptions.js'
import fastifySocketIo from './tools/plugins/socket-io.js'

dotenv.config()
export const application = fastify({
  logger: process.env.NODE_ENV === 'development',
  ajv: {
    customOptions: {
      strict: 'log',
      keywords: ['kind', 'modifier'],
      formats: {
        full: true
      }
    }
  }
})

await application.register(fastifyCors)
await application.register(fastifySensible)
await application.register(fastifySocketIo, {
  cors: {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
  }
})
await application.register(fastifyHelmet)
await application.register(fastifyRateLimit, {
  max: 200,
  timeWindow: '1 minute'
})
await application.register(fastifySwagger, swaggerOptions)
await application.register(services)
