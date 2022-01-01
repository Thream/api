import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../../models/utils.js'
import authenticateUser from '../../../../tools/plugins/authenticateUser.js'
import { guildSchema } from '../../../../models/Guild.js'
import { channelSchema } from '../../../../models/Channel.js'
import {
  getPaginationOptions,
  queryPaginationObjectSchema
} from '../../../../tools/database/pagination.js'

type QuerySchemaType = Static<typeof queryPaginationObjectSchema>

const parametersSchema = Type.Object({
  guildId: guildSchema.id
})

type Parameters = Static<typeof parametersSchema>

const getServiceSchema: FastifySchema = {
  description: 'GET all the channels of a guild with its id.',
  tags: ['channels'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  params: parametersSchema,
  querystring: queryPaginationObjectSchema,
  response: {
    200: Type.Array(Type.Object(channelSchema)),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    404: fastifyErrors[404],
    500: fastifyErrors[500]
  }
} as const

export const getChannelsByGuildIdService: FastifyPluginAsync = async (
  fastify
) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Params: Parameters
    Querystring: QuerySchemaType
  }>({
    method: 'GET',
    url: '/guilds/:guildId/channels',
    schema: getServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { guildId } = request.params
      const member = await prisma.member.findFirst({
        where: { guildId, userId: request.user.current.id }
      })
      if (member == null) {
        throw fastify.httpErrors.notFound('Member not found')
      }
      const channels = await prisma.channel.findMany({
        ...getPaginationOptions(request.query),
        where: {
          guildId
        }
      })
      reply.statusCode = 200
      return channels
    }
  })
}
