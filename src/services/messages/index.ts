import { FastifyPluginAsync } from 'fastify'

import { deleteMessageService } from './[messageId]/delete.js'
import { putMessageService } from './[messageId]/put.js'

export const messagesService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(putMessageService)
  await fastify.register(deleteMessageService)
}
