import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../../../tools/database/prisma.js'
import { fastifyErrors, id } from '../../../../../models/utils.js'
import authenticateUser from '../../../../../tools/plugins/authenticateUser.js'
import { guildSchema } from '../../../../../models/Guild.js'
import { memberSchema } from '../../../../../models/Member.js'
import { userPublicWithoutSettingsSchema } from '../../../../../models/User.js'

const parametersSchema = Type.Object({
  guildId: guildSchema.id
})

type Parameters = Static<typeof parametersSchema>

const postServiceSchema: FastifySchema = {
  description: 'Join a guild (create a member).',
  tags: ['members'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  params: parametersSchema,
  response: {
    201: Type.Object({
      ...memberSchema,
      guild: Type.Object({
        ...guildSchema,
        defaultChannelId: id
      }),
      user: Type.Object(userPublicWithoutSettingsSchema)
    }),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    500: fastifyErrors[500]
  }
} as const

export const postMemberService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Params: Parameters
  }>({
    method: 'POST',
    url: '/guilds/:guildId/members/join',
    schema: postServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { user } = request
      const { guildId } = request.params
      const memberCheck = await prisma.member.findFirst({
        where: {
          userId: user.current.id,
          guildId
        }
      })
      if (memberCheck != null) {
        throw fastify.httpErrors.badRequest(
          "Guild doesn't exist or you are already in the guild"
        )
      }
      const member = await prisma.member.create({
        data: {
          guildId,
          userId: user.current.id
        },
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
      const item = {
        ...member,
        user: {
          ...member.user,
          email: null
        },
        guild: {
          ...guild,
          defaultChannelId: channel?.id
        }
      }
      await fastify.io.emitToMembers({
        event: 'members',
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
