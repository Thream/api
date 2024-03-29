import type { Static } from "@sinclair/typebox"
import { Type } from "@sinclair/typebox"
import type { FastifyPluginAsync, FastifySchema } from "fastify"

import prisma from "#src/tools/database/prisma.js"
import { fastifyErrors } from "#src/models/utils.js"
import authenticateUser from "#src/tools/plugins/authenticateUser.js"
import { messageSchema } from "#src/models/Message.js"
import { channelSchema } from "#src/models/Channel.js"
import { memberSchema } from "#src/models/Member.js"
import { userPublicWithoutSettingsSchema } from "#src/models/User.js"

const parametersSchema = Type.Object({
  channelId: channelSchema.id,
})

type Parameters = Static<typeof parametersSchema>

const bodyPostServiceSchema = Type.Object({
  value: messageSchema.value,
})

type BodyPostServiceSchemaType = Static<typeof bodyPostServiceSchema>

const postServiceSchema: FastifySchema = {
  description:
    "POST a new message (text) in a specific channel using its channelId.",
  tags: ["messages"] as string[],
  security: [
    {
      bearerAuth: [],
    },
  ] as Array<{ [key: string]: [] }>,
  body: bodyPostServiceSchema,
  params: parametersSchema,
  response: {
    200: Type.Object({
      ...messageSchema,
      member: Type.Object({
        ...memberSchema,
        user: Type.Object(userPublicWithoutSettingsSchema),
      }),
    }),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    404: fastifyErrors[404],
    500: fastifyErrors[500],
  },
} as const

export const postMessageByChannelIdService: FastifyPluginAsync = async (
  fastify,
) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Body: BodyPostServiceSchemaType
    Params: Parameters
  }>({
    method: "POST",
    url: "/channels/:channelId/messages",
    schema: postServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { channelId } = request.params
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
      })
      if (channel == null) {
        throw fastify.httpErrors.notFound("Channel not found")
      }
      const memberCheck = await prisma.member.findFirst({
        where: { guildId: channel.guildId, userId: request.user.current.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              logo: true,
              status: true,
              biography: true,
              website: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      })
      if (memberCheck == null) {
        throw fastify.httpErrors.notFound("Channel not found")
      }
      const { value } = request.body
      const message = await prisma.message.create({
        data: {
          value,
          type: "text",
          mimetype: "text/plain",
          channelId,
          memberId: memberCheck.id,
        },
      })
      const item = {
        ...message,
        member: {
          ...memberCheck,
          user: {
            ...memberCheck.user,
            email: null,
          },
        },
      }
      await fastify.io.emitToMembers({
        event: "messages",
        guildId: item.member.guildId,
        payload: { action: "create", item },
      })
      reply.statusCode = 201
      return item
    },
  })
}
