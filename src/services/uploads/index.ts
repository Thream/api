import { FastifyPluginAsync } from 'fastify'

import { getGuildsUploadsService } from './guilds/get.js'
import { getMessagesUploadsService } from './messages/get.js'
import { getUsersUploadsService } from './users/get.js'

export const uploadsService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(getGuildsUploadsService)
  await fastify.register(getMessagesUploadsService)
  await fastify.register(getUsersUploadsService)
}
