import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../models/utils.js'
import authenticateUser from '../../../tools/plugins/authenticateUser.js'
import { guildSchema } from '../../../models/Guild.js'
import { memberSchema } from '../../../models/Member.js'
import { userPublicWithoutSettingsSchema } from '../../../models/User.js'
import { channelSchema } from '../../../models/Channel.js'

const parametersSchema = Type.Object({
  guildId: guildSchema.id
})

type Parameters = Static<typeof parametersSchema>

const getServiceSchema: FastifySchema = {
  description: 'GET a guild member with the guildId.',
  tags: ['guilds'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  params: parametersSchema,
  response: {
    200: Type.Object({
      guild: Type.Object({
        ...guildSchema,
        defaultChannelId: channelSchema.id
      }),
      member: Type.Object({
        ...memberSchema,
        user: Type.Object(userPublicWithoutSettingsSchema)
      })
    }),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    404: fastifyErrors[404],
    500: fastifyErrors[500]
  }
} as const

export const getGuildMemberByIdService: FastifyPluginAsync = async (
  fastify
) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Params: Parameters
  }>({
    method: 'GET',
    url: '/guilds/:guildId',
    schema: getServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { guildId } = request.params
      const member = await prisma.member.findFirst({
        where: { guildId, userId: request.user.current.id },
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
          },
          guild: true
        }
      })
      if (member == null) {
        throw fastify.httpErrors.notFound('Member not found')
      }
      const defaultChannel = await prisma.channel.findFirst({
        where: { guildId: member.guildId }
      })
      if (defaultChannel == null) {
        throw fastify.httpErrors.internalServerError()
      }
      const item = {
        guild: {
          ...member.guild,
          defaultChannelId: defaultChannel.id
        },
        member: {
          ...member,
          user: {
            ...member.user,
            email: null
          }
        }
      }
      reply.statusCode = 200
      return item
    }
  })
}
