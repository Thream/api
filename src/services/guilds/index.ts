import type { FastifyPluginAsync } from "fastify"

import { getGuilds } from "./get.js"
import { postGuilds } from "./post.js"
import { getGuildsPublic } from "./public/get.js"
import { getChannelsByGuildIdService } from "./[guildId]/channels/get.js"
import { postChannelService } from "./[guildId]/channels/post.js"
import { deleteGuildByIdService } from "./[guildId]/delete.js"
import { getGuildMemberByIdService } from "./[guildId]/get.js"
import { putGuildIconById } from "./[guildId]/icon/put.js"
import { getMembersByGuildIdService } from "./[guildId]/members/get.js"
import { postMemberService } from "./[guildId]/members/join/post.js"
import { deleteMemberService } from "./[guildId]/members/leave/delete.js"
import { putGuildByIdService } from "./[guildId]/put.js"

export const guildsService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(postGuilds)
  await fastify.register(getGuilds)
  await fastify.register(putGuildIconById)
  await fastify.register(getGuildMemberByIdService)
  await fastify.register(getChannelsByGuildIdService)
  await fastify.register(getGuildsPublic)
  await fastify.register(getMembersByGuildIdService)
  await fastify.register(putGuildByIdService)
  await fastify.register(deleteGuildByIdService)
  await fastify.register(postMemberService)
  await fastify.register(deleteMemberService)
  await fastify.register(postChannelService)
}
