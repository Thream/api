import { FastifyPluginAsync } from 'fastify'

import { helloService } from './hello'
import { usersService } from './users'

export const services: FastifyPluginAsync = async (fastify) => {
  await fastify.register(helloService)
  await fastify.register(usersService)
}
