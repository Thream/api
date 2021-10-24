import { FastifyPluginAsync } from 'fastify'

import { postGuilds } from './post.js'

export const guildsService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(postGuilds)
}
