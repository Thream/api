import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../models/utils.js'
import authenticateUser from '../../../tools/plugins/authenticateUser.js'
import { messageSchema } from '../../../models/Message.js'
import { memberSchema } from '../../../models/Member.js'
import { userPublicWithoutSettingsSchema } from '../../../models/User.js'

const bodyPutServiceSchema = Type.Object({
  value: messageSchema.value
})

type BodyPutServiceSchemaType = Static<typeof bodyPutServiceSchema>

const parametersSchema = Type.Object({
  messageId: messageSchema.id
})

type Parameters = Static<typeof parametersSchema>

const putServiceSchema: FastifySchema = {
  description: 'UPDATE a message with its id.',
  tags: ['messages'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  body: bodyPutServiceSchema,
  params: parametersSchema,
  response: {
    200: Type.Object({
      ...messageSchema,
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

export const putMessageService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Body: BodyPutServiceSchemaType
    Params: Parameters
  }>({
    method: 'PUT',
    url: '/messages/:messageId',
    schema: putServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { user } = request
      const { messageId } = request.params
      const { value } = request.body
      const messageCheck = await prisma.message.findFirst({
        where: { id: messageId, type: 'text' },
        include: {
          channel: true
        }
      })
      if (messageCheck == null || messageCheck.channel == null) {
        throw fastify.httpErrors.notFound('Message not found')
      }
      const member = await prisma.member.findFirst({
        where: {
          guildId: messageCheck.channel.guildId,
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
      if (member == null) {
        throw fastify.httpErrors.notFound('Member not found')
      }
      if (member.userId !== user.current.id) {
        throw fastify.httpErrors.badRequest(
          'You should be the owner of the message'
        )
      }
      const message = await prisma.message.update({
        where: {
          id: messageCheck.id
        },
        data: {
          value
        }
      })
      const item = {
        ...message,
        member: {
          ...member,
          user: {
            ...member.user,
            email: null
          }
        }
      }
      await fastify.io.emitToMembers({
        event: 'messages',
        guildId: item.member.guildId,
        payload: { action: 'update', item }
      })
      reply.statusCode = 200
      return item
    }
  })
}
