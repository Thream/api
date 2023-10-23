import type { Static } from "@sinclair/typebox"
import { Type } from "@sinclair/typebox"
import type { FastifyPluginAsync, FastifySchema } from "fastify"

import prisma from "#src/tools/database/prisma.js"
import { fastifyErrors } from "#src/models/utils.js"
import authenticateUser from "#src/tools/plugins/authenticateUser.js"
import { channelSchema } from "#src/models/Channel.js"

const parametersSchema = Type.Object({
  channelId: channelSchema.id,
})

type Parameters = Static<typeof parametersSchema>

const deleteServiceSchema: FastifySchema = {
  description: "DELETE a channel with its id.",
  tags: ["channels"] as string[],
  security: [
    {
      bearerAuth: [],
    },
  ] as Array<{ [key: string]: [] }>,
  params: parametersSchema,
  response: {
    200: Type.Object({
      ...channelSchema,
      defaultChannelId: channelSchema.id,
    }),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    404: fastifyErrors[404],
    500: fastifyErrors[500],
  },
} as const

export const deleteChannelService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Params: Parameters
  }>({
    method: "DELETE",
    url: "/channels/:channelId",
    schema: deleteServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { user, params } = request
      const { channelId } = params
      const channelCheck = await prisma.channel.findUnique({
        where: { id: channelId },
      })
      if (channelCheck == null) {
        throw fastify.httpErrors.notFound("Channel not found")
      }
      const member = await prisma.member.findFirst({
        where: { guildId: channelCheck.guildId, userId: user.current.id },
      })
      if (member == null) {
        throw fastify.httpErrors.notFound("Member not found")
      }
      if (!member.isOwner) {
        throw fastify.httpErrors.badRequest("You should be a member owner")
      }
      const channelCount = await prisma.channel.count({
        where: { guildId: channelCheck.guildId },
      })
      if (channelCount <= 1) {
        throw fastify.httpErrors.badRequest(
          "The guild should have at least one channel",
        )
      }
      const channel = await prisma.channel.delete({
        where: { id: channelId },
      })
      const defaultChannel = await prisma.channel.findFirst({
        where: { guildId: member.guildId },
      })
      if (defaultChannel == null) {
        throw fastify.httpErrors.internalServerError()
      }
      const item = {
        ...channel,
        defaultChannelId: defaultChannel.id,
      }
      await fastify.io.emitToMembers({
        event: "channels",
        guildId: member.guildId,
        payload: {
          action: "delete",
          item,
        },
      })
      reply.statusCode = 200
      return item
    },
  })
}
