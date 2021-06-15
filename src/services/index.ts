import { FastifyPluginAsync } from 'fastify'

import { uploadsService } from './uploads'
import { usersService } from './users'

export const services: FastifyPluginAsync = async (fastify) => {
  await fastify.register(usersService)
  await fastify.register(uploadsService)
}
