import { FastifyPluginAsync } from 'fastify'

import { usersService } from './users'

export const services: FastifyPluginAsync = async (fastify) => {
  await fastify.register(usersService)
}
