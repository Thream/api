import type { FastifyPluginAsync } from 'fastify'

import { usersService } from './users/index.js'
import { guildsService } from './guilds/index.js'
import { channelsService } from './channels/index.js'
import { messagesService } from './messages/index.js'

export const services: FastifyPluginAsync = async (fastify) => {
  await fastify.register(channelsService)
  await fastify.register(guildsService)
  await fastify.register(messagesService)
  await fastify.register(usersService)
}
