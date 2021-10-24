import { FastifyPluginAsync } from 'fastify'

import { usersService } from './users/index.js'
import { guildsService } from './guilds/index.js'
import { uploadsService } from './uploads/index.js'

export const services: FastifyPluginAsync = async (fastify) => {
  await fastify.register(usersService)
  await fastify.register(guildsService)
  await fastify.register(uploadsService)
}
