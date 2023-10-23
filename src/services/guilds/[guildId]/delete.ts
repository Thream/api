import type { Static } from "@sinclair/typebox"
import { Type } from "@sinclair/typebox"
import type { FastifyPluginAsync, FastifySchema } from "fastify"

import prisma from "#src/tools/database/prisma.js"
import { fastifyErrors } from "#src/models/utils.js"
import authenticateUser from "#src/tools/plugins/authenticateUser.js"
import { guildSchema } from "#src/models/Guild.js"

const parametersSchema = Type.Object({
  guildId: guildSchema.id,
})

type Parameters = Static<typeof parametersSchema>

const deleteServiceSchema: FastifySchema = {
  description: "DELETE a guild with the guildId.",
  tags: ["guilds"] as string[],
  security: [
    {
      bearerAuth: [],
    },
  ] as Array<{ [key: string]: [] }>,
  params: parametersSchema,
  response: {
    200: Type.Object(guildSchema),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    404: fastifyErrors[404],
    500: fastifyErrors[500],
  },
} as const

export const deleteGuildByIdService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Params: Parameters
  }>({
    method: "DELETE",
    url: "/guilds/:guildId",
    schema: deleteServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { guildId } = request.params
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
      await fastify.io.emitToMembers({
        event: "guilds",
        guildId: member.guildId,
        payload: {
          action: "delete",
          item: member.guild,
        },
      })
      const guild = await prisma.guild.delete({
        where: { id: member.guildId },
      })
      reply.statusCode = 200
      return guild
    },
  })
}
