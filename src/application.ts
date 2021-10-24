import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import fastifySwagger from 'fastify-swagger'
import fastifyUrlData from 'fastify-url-data'
import fastifyHelmet from 'fastify-helmet'
import fastifyRateLimit from 'fastify-rate-limit'
import fastifySensible from 'fastify-sensible'
import fastifyStatic from 'fastify-static'

import { services } from './services/index.js'
import { swaggerOptions } from './tools/configurations/swaggerOptions.js'
import fastifySocketIo from './tools/plugins/socket-io.js'
import { UPLOADS_URL } from './tools/configurations/index.js'

export const application = fastify({
  logger: process.env.NODE_ENV === 'development'
})
dotenv.config()

const main = async (): Promise<void> => {
  await application.register(fastifyCors)
  await application.register(fastifySensible)
  await application.register(fastifyUrlData)
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
    max: 100,
    timeWindow: '1 minute'
  })
  await application.register(fastifyStatic, {
    root: fileURLToPath(UPLOADS_URL),
    prefix: '/uploads/'
  })
  await application.register(fastifySwagger, swaggerOptions)
  await application.register(services)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
