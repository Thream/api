import type { Static } from "@sinclair/typebox"
import { Type } from "@sinclair/typebox"
import type { FastifyPluginAsync, FastifySchema } from "fastify"

import prisma from "#src/tools/database/prisma.js"
import { fastifyErrors } from "#src/models/utils.js"
import authenticateUser from "#src/tools/plugins/authenticateUser.js"
import { guildSchema } from "#src/models/Guild.js"
import { parseStringNullish } from "#src/tools/utils/parseStringNullish.js"
import { channelSchema } from "#src/models/Channel.js"

const parametersSchema = Type.Object({
  guildId: guildSchema.id,
})

type Parameters = Static<typeof parametersSchema>

const bodyPutServiceSchema = Type.Object({
  name: Type.Optional(guildSchema.name),
  description: Type.Optional(guildSchema.description),
})

type BodyPutServiceSchemaType = Static<typeof bodyPutServiceSchema>

const putServiceSchema: FastifySchema = {
  description: "Update a guild with the guildId.",
  tags: ["guilds"] as string[],
  security: [
    {
      bearerAuth: [],
    },
  ] as Array<{ [key: string]: [] }>,
  body: bodyPutServiceSchema,
  params: parametersSchema,
  response: {
    200: Type.Object({
      ...guildSchema,
      defaultChannelId: channelSchema.id,
    }),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    404: fastifyErrors[404],
    500: fastifyErrors[500],
  },
} as const

export const putGuildByIdService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Body: BodyPutServiceSchemaType
    Params: Parameters
  }>({
    method: "PUT",
    url: "/guilds/:guildId",
    schema: putServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { guildId } = request.params
      const { name, description } = request.body
      const member = await prisma.member.findFirst({
        where: { guildId, userId: request.user.current.id },
        include: {
          guild: true,
        },
      })
      if (member == null || member.guild == null) {
        throw fastify.httpErrors.notFound("Member not found")
      }
      if (!member.isOwner) {
        throw fastify.httpErrors.badRequest(
          "You should be an owner of the guild",
        )
      }
      const guild = await prisma.guild.update({
        where: { id: guildId },
        data: {
          name: name ?? member.guild.name,
          description: parseStringNullish(
            member.guild.description,
            description,
          ),
        },
      })
      const defaultChannel = await prisma.channel.findFirst({
        where: { guildId: guild.id },
      })
      if (defaultChannel == null) {
        throw fastify.httpErrors.internalServerError()
      }
      const item = {
        ...guild,
        defaultChannelId: defaultChannel.id,
      }
      await fastify.io.emitToMembers({
        event: "guilds",
        guildId: guild.id,
        payload: { action: "update", item },
      })
      reply.statusCode = 200
      return item
    },
  })
}
