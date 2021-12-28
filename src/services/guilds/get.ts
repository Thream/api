import { Type, Static } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../tools/database/prisma.js'
import { fastifyErrors, id } from '../../models/utils.js'
import authenticateUser from '../../tools/plugins/authenticateUser.js'
import { guildSchema } from '../../models/Guild.js'
import {
  getPaginationOptions,
  queryPaginationObjectSchema
} from '../../tools/database/pagination.js'

type QuerySchemaType = Static<typeof queryPaginationObjectSchema>

const getServiceSchema: FastifySchema = {
  description: 'GET all the guilds of an user.',
  tags: ['guilds'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  querystring: queryPaginationObjectSchema,
  response: {
    200: Type.Array(
      Type.Object({
        ...guildSchema,
        defaultChannelId: id
      })
    ),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    500: fastifyErrors[500]
  }
} as const

export const getGuilds: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Querystring: QuerySchemaType
  }>({
    method: 'GET',
    url: '/guilds',
    schema: getServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const membersRequest = await prisma.member.findMany({
        ...getPaginationOptions(request.query),
        where: {
          userId: request.user.current.id
        }
      })
      const guilds = await Promise.all(
        membersRequest.map(async (member) => {
          const channel = await prisma.channel.findFirst({
            where: {
              guildId: member.guildId
            }
          })
          const guild = await prisma.guild.findUnique({
            where: {
              id: member.guildId
            }
          })
          return {
            ...guild,
            defaultChannelId: channel?.id
          }
        })
      )
      reply.statusCode = 200
      return guilds
    }
  })
}
