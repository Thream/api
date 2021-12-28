import { FastifyPluginAsync } from 'fastify'

import { getChannelByIdService } from './[channelId]/get'

export const channelsService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(getChannelByIdService)
}
