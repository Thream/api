import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../../models/utils.js'
import authenticateUser from '../../../../tools/plugins/authenticateUser.js'
import { channelSchema } from '../../../../models/Channel.js'
import { guildSchema } from '../../../../models/Guild.js'

const bodyPostServiceSchema = Type.Object({
  name: channelSchema.name
})

type BodyPostServiceSchemaType = Static<typeof bodyPostServiceSchema>

const parametersSchema = Type.Object({
  guildId: guildSchema.id
})

type Parameters = Static<typeof parametersSchema>

const postChannelServiceSchema: FastifySchema = {
  description: 'Create a channel.',
  tags: ['channels'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  body: bodyPostServiceSchema,
  params: parametersSchema,
  response: {
    201: Type.Object({
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

export const postChannelService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Body: BodyPostServiceSchemaType
    Params: Parameters
  }>({
    method: 'POST',
    url: '/guilds/:guildId/channels',
    schema: postChannelServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { user } = request
      const { guildId } = request.params
      const { name } = request.body
      const member = await prisma.member.findFirst({
        where: { guildId, userId: user.current.id }
      })
      if (member == null) {
        throw fastify.httpErrors.notFound('Member not found')
      }
      if (!member.isOwner) {
        throw fastify.httpErrors.badRequest('You should be a member owner')
      }
      const channel = await prisma.channel.create({
        data: {
          name,
          guildId
        }
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
        guildId,
        payload: {
          action: 'create',
          item
        }
      })
      reply.statusCode = 201
      return item
    }
  })
}
