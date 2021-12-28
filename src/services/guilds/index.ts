import { FastifyPluginAsync } from 'fastify'

import { getGuilds } from './get.js'
import { postGuilds } from './post.js'
import { getGuildsPublic } from './public/get.js'
import { getGuildMemberByIdService } from './[guildId]/get.js'
import { putGuildIconById } from './[guildId]/icon/put.js'

export const guildsService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(postGuilds)
  await fastify.register(getGuilds)
  await fastify.register(putGuildIconById)
  await fastify.register(getGuildMemberByIdService)
  await fastify.register(getGuildsPublic)
}
