import { FastifyPluginAsync } from 'fastify'

import { postGuilds } from './post.js'
import { putGuildIconById } from './[guildId]/icon/put.js'

export const guildsService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(postGuilds)
  await fastify.register(putGuildIconById)
}
