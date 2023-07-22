import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '#src/tools/database/prisma.js'
import { fastifyErrors } from '#src/models/utils.js'
import { userPublicSchema } from '#src/models/User.js'
import { guildSchema } from '#src/models/Guild.js'

const parametersGetUserSchema = Type.Object({
  userId: userPublicSchema.id
})

type ParametersGetUser = Static<typeof parametersGetUserSchema>

const getServiceSchema: FastifySchema = {
  description: 'GET the public user informations with its id',
  tags: ['users'] as string[],
  params: parametersGetUserSchema,
  response: {
    200: Type.Object({
      user: Type.Object(userPublicSchema),
      guilds: Type.Array(Type.Object(guildSchema))
    }),
    400: fastifyErrors[400],
    404: fastifyErrors[404],
    500: fastifyErrors[500]
  }
} as const

export const getUserById: FastifyPluginAsync = async (fastify) => {
  await fastify.route<{
    Params: ParametersGetUser
  }>({
    method: 'GET',
    url: '/users/:userId',
    schema: getServiceSchema,
    handler: async (request, reply) => {
      const { userId } = request.params
      const settings = await prisma.userSetting.findFirst({
        where: { userId }
      })
      if (settings == null) {
        throw fastify.httpErrors.notFound('User not found')
      }
      const user = await prisma.user.findUnique({
        where: {
          id: userId
        },
        select: {
          id: true,
          name: true,
          email: settings.isPublicEmail,
          isConfirmed: true,
          logo: true,
          status: true,
          biography: true,
          website: true,
          createdAt: true,
          updatedAt: true
        }
      })
      if (user == null) {
        throw fastify.httpErrors.notFound('User not found')
      }
      reply.statusCode = 200
      return {
        user: {
          ...user,
          email: user.email ?? null,
          settings
        },
        guilds: !settings.isPublicGuilds
          ? []
          : await prisma.guild.findMany({
              take: 10,
              where: {
                members: {
                  some: {
                    userId
                  }
                }
              }
            })
      }
    }
  })
}
