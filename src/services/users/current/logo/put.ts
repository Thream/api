import { Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'
import fastifyMultipart from '@fastify/multipart'

import authenticateUser from '../../../../tools/plugins/authenticateUser.js'
import { fastifyErrors } from '../../../../models/utils.js'
import prisma from '../../../../tools/database/prisma.js'
import { uploadFile } from '../../../../tools/utils/uploadFile.js'

const putServiceSchema: FastifySchema = {
  description: 'Edit the current connected user logo',
  tags: ['users'] as string[],
  consumes: ['multipart/form-data'] as string[],
  produces: ['application/json'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  response: {
    200: Type.Object({
      user: Type.Object({
        logo: Type.String()
      })
    }),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    431: fastifyErrors[431],
    500: fastifyErrors[500]
  }
} as const

export const putCurrentUserLogo: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  await fastify.register(fastifyMultipart)

  fastify.route({
    method: 'PUT',
    url: '/users/current/logo',
    schema: putServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const file = await uploadFile({
        fastify,
        request,
        folderInUploadsFolder: 'users'
      })
      await prisma.user.update({
        where: { id: request.user.current.id },
        data: { logo: file.pathToStoreInDatabase }
      })
      reply.statusCode = 200
      return {
        user: {
          logo: file.pathToStoreInDatabase
        }
      }
    }
  })
}
