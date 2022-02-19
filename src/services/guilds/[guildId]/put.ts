import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../models/utils.js'
import authenticateUser from '../../../tools/plugins/authenticateUser.js'
import { guildSchema } from '../../../models/Guild.js'
import { parseStringNullish } from '../../../tools/utils/parseStringNullish.js'

const parametersSchema = Type.Object({
  guildId: guildSchema.id
})

type Parameters = Static<typeof parametersSchema>

const bodyPutServiceSchema = Type.Object({
  name: Type.Optional(guildSchema.name),
  description: Type.Optional(guildSchema.description)
})

type BodyPutServiceSchemaType = Static<typeof bodyPutServiceSchema>

const putServiceSchema: FastifySchema = {
  description: 'Update a guild with the guildId.',
  tags: ['guilds'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  body: bodyPutServiceSchema,
  params: parametersSchema,
  response: {
    200: Type.Object(guildSchema),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    404: fastifyErrors[404],
    500: fastifyErrors[500]
  }
} as const

export const putGuildByIdService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Body: BodyPutServiceSchemaType
    Params: Parameters
  }>({
    method: 'PUT',
    url: '/guilds/:guildId',
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
          guild: true
        }
      })
      if (member == null || member.guild == null) {
        throw fastify.httpErrors.notFound('Member not found')
      }
      if (!member.isOwner) {
        throw fastify.httpErrors.forbidden(
          'You should be an owner of the guild'
        )
      }
      const guild = await prisma.guild.update({
        where: { id: guildId },
        data: {
          name: name ?? member.guild.name,
          description: parseStringNullish(member.guild.description, description)
        }
      })
      await fastify.io.emitToMembers({
        event: 'guilds',
        guildId: guild.id,
        payload: { action: 'update', item: guild }
      })
      reply.statusCode = 200
      return guild
    }
  })
}
