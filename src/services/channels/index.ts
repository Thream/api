import type { FastifyPluginAsync } from "fastify"

import { deleteChannelService } from "./[channelId]/delete.js"
import { getChannelByIdService } from "./[channelId]/get.js"
import { getMessagesByChannelIdService } from "./[channelId]/messages/get.js"
import { postMessageByChannelIdService } from "./[channelId]/messages/post.js"
import { postMessageUploadsByChannelIdService } from "./[channelId]/messages/uploads/post.js"
import { putChannelService } from "./[channelId]/put.js"

export const channelsService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(getChannelByIdService)
  await fastify.register(getMessagesByChannelIdService)
  await fastify.register(postMessageByChannelIdService)
  await fastify.register(postMessageUploadsByChannelIdService)
  await fastify.register(putChannelService)
  await fastify.register(deleteChannelService)
}
