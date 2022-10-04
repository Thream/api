import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../models/utils.js'
import authenticateUser from '../../../tools/plugins/authenticateUser.js'
import { guildSchema } from '../../../models/Guild.js'
import {
  getPaginationOptions,
  queryPaginationSchema
} from '../../../tools/database/pagination.js'

const querySchema = Type.Object({
  search: Type.Optional(Type.String()),
  ...queryPaginationSchema
})

export type QuerySchemaType = Static<typeof querySchema>

const getServiceSchema: FastifySchema = {
  description:
    'GET all the public guilds (ordered by descending members count).',
  tags: ['guilds'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  querystring: querySchema,
  response: {
    200: Type.Array(
      Type.Object({
        ...guildSchema,
        membersCount: Type.Integer()
      })
    ),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    500: fastifyErrors[500]
  }
} as const

export const getGuildsPublic: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Querystring: QuerySchemaType
  }>({
    method: 'GET',
    url: '/guilds/public',
    schema: getServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const guildsRequest = await prisma.guild.findMany({
        ...getPaginationOptions(request.query),
        orderBy: {
          members: {
            _count: 'desc'
          }
        },
        ...(request.query.search != null && {
          where: {
            name: { contains: request.query.search }
          }
        })
      })
      const guilds = await Promise.all(
        guildsRequest.map(async (guild) => {
          const membersCount = await prisma.member.count({
            where: { guildId: guild.id }
          })
          return {
            ...guild,
            membersCount
          }
        })
      )
      reply.statusCode = 200
      return guilds
    }
  })
}
