import { Type, Static } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'
import fastifyMultipart from 'fastify-multipart'

import prisma from '../../../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../../../models/utils.js'
import authenticateUser from '../../../../../tools/plugins/authenticateUser.js'
import { messageSchema } from '../../../../../models/Message.js'
import { memberSchema } from '../../../../../models/Member.js'
import { userPublicWithoutSettingsSchema } from '../../../../../models/User.js'
import { channelSchema } from '../../../../../models/Channel.js'
import { uploadFile } from '../../../../../tools/utils/uploadFile.js'
import { maximumFileSize } from '../../../../../tools/configurations/index.js'

const parametersSchema = Type.Object({
  channelId: channelSchema.id
})

type Parameters = Static<typeof parametersSchema>

const postServiceSchema: FastifySchema = {
  description:
    'POST a new message (file) in a specific channel using its channelId.',
  tags: ['messages'] as string[],
  consumes: ['multipart/form-data'] as string[],
  produces: ['application/json'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
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

export const postMessageUploadsByChannelIdService: FastifyPluginAsync = async (
  fastify
) => {
  await fastify.register(authenticateUser)

  await fastify.register(fastifyMultipart)

  fastify.route<{
    Params: Parameters
  }>({
    method: 'POST',
    url: '/channels/:channelId/messages/uploads',
    schema: postServiceSchema,
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
        where: { guildId: channel.guildId, userId: request.user.current.id },
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
      if (memberCheck == null) {
        throw fastify.httpErrors.notFound('Channel not found')
      }
      const file = await uploadFile({
        fastify,
        request,
        folderInUploadsFolder: 'messages',
        maximumFileSize: maximumFileSize
      })
      const message = await prisma.message.create({
        data: {
          value: file.pathToStoreInDatabase,
          type: 'file',
          mimetype: file.mimetype,
          channelId,
          memberId: memberCheck.id
        }
      })
      reply.statusCode = 201
      return {
        ...message,
        member: {
          ...memberCheck,
          user: {
            ...memberCheck.user,
            email: null
          }
        }
      }
    }
  })
}
