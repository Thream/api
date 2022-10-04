import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../tools/database/prisma.js'
import { fastifyErrors } from '../../models/utils.js'
import authenticateUser from '../../tools/plugins/authenticateUser.js'
import { guildSchema } from '../../models/Guild.js'
import { channelSchema } from '../../models/Channel.js'
import { memberSchema } from '../../models/Member.js'
import { userPublicWithoutSettingsSchema } from '../../models/User.js'
import { parseStringNullish } from '../../tools/utils/parseStringNullish.js'

const bodyPostServiceSchema = Type.Object({
  name: guildSchema.name,
  description: guildSchema.description
})

type BodyPostServiceSchemaType = Static<typeof bodyPostServiceSchema>

const postServiceSchema: FastifySchema = {
  description: 'Create a guild.',
  tags: ['guilds'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  body: bodyPostServiceSchema,
  response: {
    201: Type.Object({
      guild: Type.Object({
        ...guildSchema,
        channels: Type.Array(Type.Object(channelSchema)),
        members: Type.Array(
          Type.Object({
            ...memberSchema,
            user: Type.Object(userPublicWithoutSettingsSchema)
          })
        )
      })
    }),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    500: fastifyErrors[500]
  }
} as const

export const postGuilds: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Body: BodyPostServiceSchemaType
  }>({
    method: 'POST',
    url: '/guilds',
    schema: postServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { name, description } = request.body
      const guild = await prisma.guild.create({
        data: { name, description: parseStringNullish(description) }
      })
      const channel = await prisma.channel.create({
        data: { name: 'general', guildId: guild.id }
      })
      const memberCreated = await prisma.member.create({
        data: {
          userId: request.user.current.id,
          isOwner: true,
          guildId: guild.id
        }
      })
      const members = await Promise.all(
        [memberCreated].map(async (member) => {
          const user = await prisma.user.findUnique({
            where: { id: member?.userId }
          })
          return {
            ...member,
            user
          }
        })
      )
      reply.statusCode = 201
      return {
        guild: {
          ...guild,
          channels: [channel],
          members
        }
      }
    }
  })
}
