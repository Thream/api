import { FastifyPluginAsync } from 'fastify'

import { getChannelByIdService } from './[channelId]/get'
import { getMessagesByChannelIdService } from './[channelId]/messages/get'

export const channelsService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(getChannelByIdService)
  await fastify.register(getMessagesByChannelIdService)
}
