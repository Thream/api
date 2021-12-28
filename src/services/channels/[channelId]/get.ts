import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../models/utils.js'
import authenticateUser from '../../../tools/plugins/authenticateUser.js'
import { channelSchema } from '../../../models/Channel'

const parametersSchema = Type.Object({
  channelId: channelSchema.id
})

type Parameters = Static<typeof parametersSchema>

const getServiceSchema: FastifySchema = {
  description: 'GET a channel with its id.',
  tags: ['channels'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  params: parametersSchema,
  response: {
    200: Type.Object({
      channel: Type.Object(channelSchema)
    }),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    404: fastifyErrors[404],
    500: fastifyErrors[500]
  }
} as const

export const getChannelByIdService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Params: Parameters
  }>({
    method: 'GET',
    url: '/channels/:channelId',
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
      const member = await prisma.member.findFirst({
        where: { guildId: channel.guildId, userId: request.user.current.id }
      })
      if (member == null) {
        throw fastify.httpErrors.notFound('Channel not found')
      }
      reply.statusCode = 200
      return { channel }
    }
  })
}
