import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../models/utils.js'
import authenticateUser from '../../../tools/plugins/authenticateUser.js'
import { channelSchema } from '../../../models/Channel.js'

const bodyPutServiceSchema = Type.Object({
  name: channelSchema.name
})

type BodyPutServiceSchemaType = Static<typeof bodyPutServiceSchema>

const parametersSchema = Type.Object({
  channelId: channelSchema.id
})

type Parameters = Static<typeof parametersSchema>

const putServiceSchema: FastifySchema = {
  description: 'UPDATE a channel with its id.',
  tags: ['channels'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  params: parametersSchema,
  body: bodyPutServiceSchema,
  response: {
    200: Type.Object({
      ...channelSchema,
      defaultChannelId: channelSchema.id
    }),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    404: fastifyErrors[404],
    500: fastifyErrors[500]
  }
} as const

export const putChannelService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Body: BodyPutServiceSchemaType
    Params: Parameters
  }>({
    method: 'PUT',
    url: '/channels/:channelId',
    schema: putServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { user } = request
      const { channelId } = request.params
      const { name } = request.body
      const channelCheck = await prisma.channel.findUnique({
        where: { id: channelId }
      })
      if (channelCheck == null) {
        throw fastify.httpErrors.notFound('Channel not found')
      }
      const member = await prisma.member.findFirst({
        where: { guildId: channelCheck.guildId, userId: user.current.id }
      })
      if (member == null) {
        throw fastify.httpErrors.notFound('Member not found')
      }
      if (!member.isOwner) {
        throw fastify.httpErrors.badRequest('You should be a member owner')
      }
      const channel = await prisma.channel.update({
        where: { id: channelId },
        data: { name }
      })
      const defaultChannel = await prisma.channel.findFirst({
        where: { guildId: member.guildId }
      })
      if (defaultChannel == null) {
        throw fastify.httpErrors.internalServerError()
      }
      const item = {
        ...channel,
        defaultChannelId: defaultChannel.id
      }
      await fastify.io.emitToMembers({
        event: 'channels',
        guildId: member.guildId,
        payload: {
          action: 'update',
          item
        }
      })
      reply.statusCode = 200
      return item
    }
  })
}
