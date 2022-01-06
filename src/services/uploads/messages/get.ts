import path from 'node:path'

import { FastifyPluginAsync, FastifySchema } from 'fastify'
import { Static, Type } from '@sinclair/typebox'

import { fastifyErrors } from '../../../models/utils.js'
import authenticateUser from '../../../tools/plugins/authenticateUser.js'
import prisma from '../../../tools/database/prisma.js'

const parameters = Type.Object({
  file: Type.String()
})

type Parameters = Static<typeof parameters>

export const getServiceSchema: FastifySchema = {
  tags: ['uploads'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  params: parameters,
  response: {
    200: {
      type: 'string',
      format: 'binary'
    },
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    404: fastifyErrors[404],
    500: fastifyErrors[500]
  }
} as const

export const getMessagesUploadsService: FastifyPluginAsync = async (
  fastify
) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Params: Parameters
  }>({
    method: 'GET',
    url: '/uploads/messages/:file',
    schema: getServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { file } = request.params
      const message = await prisma.message.findFirst({
        where: { value: `/uploads/messages/${file}` },
        include: {
          member: {
            select: { guildId: true }
          }
        }
      })
      if (message == null) {
        throw fastify.httpErrors.notFound('Message not found')
      }
      const member = await prisma.member.findFirst({
        where: {
          guildId: message.member?.guildId,
          userId: request.user.current.id
        }
      })
      if (member == null) {
        throw fastify.httpErrors.notFound('Member not found')
      }
      return await reply.sendFile(path.join('messages', file))
    }
  })
}
