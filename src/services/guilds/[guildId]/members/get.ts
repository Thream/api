import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '#src/tools/database/prisma.js'
import { fastifyErrors } from '#src/models/utils.js'
import authenticateUser from '#src/tools/plugins/authenticateUser.js'
import { guildSchema } from '#src/models/Guild.js'
import {
  getPaginationOptions,
  queryPaginationObjectSchema
} from '#src/tools/database/pagination.js'
import { memberSchema } from '#src/models/Member.js'
import { userPublicWithoutSettingsSchema } from '#src/models/User.js'

type QuerySchemaType = Static<typeof queryPaginationObjectSchema>

const parametersSchema = Type.Object({
  guildId: guildSchema.id
})

type Parameters = Static<typeof parametersSchema>

const getServiceSchema: FastifySchema = {
  description: 'GET all the members of a guild with its id.',
  tags: ['members'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  params: parametersSchema,
  querystring: queryPaginationObjectSchema,
  response: {
    200: Type.Array(
      Type.Object({
        ...memberSchema,
        user: Type.Object(userPublicWithoutSettingsSchema)
      })
    ),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    404: fastifyErrors[404],
    500: fastifyErrors[500]
  }
} as const

export const getMembersByGuildIdService: FastifyPluginAsync = async (
  fastify
) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Params: Parameters
    Querystring: QuerySchemaType
  }>({
    method: 'GET',
    url: '/guilds/:guildId/members',
    schema: getServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { guildId } = request.params
      const memberCheck = await prisma.member.findFirst({
        where: { guildId, userId: request.user.current.id }
      })
      if (memberCheck == null) {
        throw fastify.httpErrors.notFound('Member not found')
      }
      const membersRequest = await prisma.member.findMany({
        ...getPaginationOptions(request.query),
        orderBy: { createdAt: 'asc' },
        where: { guildId },
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
              updatedAt: true
            }
          }
        }
      })
      const members = membersRequest.map((member) => {
        return {
          ...member,
          user: {
            ...member.user,
            email: null
          }
        }
      })
      reply.statusCode = 200
      return members
    }
  })
}
