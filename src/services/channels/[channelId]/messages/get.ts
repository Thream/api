import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../../models/utils.js'
import authenticateUser from '../../../../tools/plugins/authenticateUser.js'
import { messageSchema } from '../../../../models/Message.js'
import { memberSchema } from '../../../../models/Member.js'
import { userPublicWithoutSettingsSchema } from '../../../../models/User.js'
import {
  getPaginationOptions,
  queryPaginationObjectSchema
} from '../../../../tools/database/pagination.js'
import { channelSchema } from '../../../../models/Channel.js'

type QuerySchemaType = Static<typeof queryPaginationObjectSchema>

const parametersSchema = Type.Object({
  channelId: channelSchema.id
})

type Parameters = Static<typeof parametersSchema>

const getServiceSchema: FastifySchema = {
  description: 'GET all the messages of a channel by its id.',
  tags: ['messages'] as string[],
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
        ...messageSchema,
        member: Type.Object({
          ...memberSchema,
          user: Type.Object(userPublicWithoutSettingsSchema)
        })
      })
    ),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    404: fastifyErrors[404],
    500: fastifyErrors[500]
  }
} as const

export const getMessagesByChannelIdService: FastifyPluginAsync = async (
  fastify
) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Params: Parameters
    Querystring: QuerySchemaType
  }>({
    method: 'GET',
    url: '/channels/:channelId/messages',
    schema: getServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { channelId } = request.params
      const channel = await prisma.channel.findUnique({
        where: { id: channelId }
      })
      if (channel == null) {
        throw fastify.httpErrors.notFound('Channel not found')
      }
      const memberCheck = await prisma.member.findFirst({
        where: { guildId: channel.guildId, userId: request.user.current.id }
      })
      if (memberCheck == null) {
        throw fastify.httpErrors.notFound('Channel not found')
      }
      const messagesRequest = await prisma.message.findMany({
        ...getPaginationOptions(request.query),
        orderBy: { createdAt: 'desc' },
        where: { channelId }
      })
      const messages = await Promise.all(
        messagesRequest.reverse().map(async (message) => {
          const member = await prisma.member.findFirst({
            where: { id: message.memberId },
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
          return {
            ...message,
            member: {
              ...member,
              user: {
                ...member?.user,
                email: null
              }
            }
          }
        })
      )
      reply.statusCode = 200
      return messages
    }
  })
}
