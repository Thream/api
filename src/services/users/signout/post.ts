import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../models/utils.js'
import { refreshTokensSchema } from '../../../models/RefreshToken.js'

const bodyPostSignoutSchema = Type.Object({
  refreshToken: refreshTokensSchema.token
})

type BodyPostSignoutSchemaType = Static<typeof bodyPostSignoutSchema>

const postSignoutSchema: FastifySchema = {
  description: 'Signout the user',
  tags: ['users'] as string[],
  body: bodyPostSignoutSchema,
  response: {
    200: Type.Object({}),
    400: fastifyErrors[400],
    404: fastifyErrors[404],
    500: fastifyErrors[500]
  }
} as const

export const postSignoutUser: FastifyPluginAsync = async (fastify) => {
  await fastify.route<{
    Body: BodyPostSignoutSchemaType
  }>({
    method: 'POST',
    url: '/users/signout',
    schema: postSignoutSchema,
    handler: async (request, reply) => {
      const { refreshToken } = request.body
      const token = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken
        }
      })
      if (token == null) {
        throw fastify.httpErrors.notFound()
      }
      await prisma.refreshToken.delete({
        where: {
          id: token.id
        }
      })
      reply.statusCode = 200
      return {}
    }
  })
}
