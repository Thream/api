import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'
import jwt from 'jsonwebtoken'

import prisma from '../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../models/utils.js'
import { JWT_REFRESH_SECRET } from '../../../tools/configurations/index.js'
import { UserRefreshJWT } from '../../../models/User.js'
import { jwtSchema } from '../../../tools/utils/jwtToken.js'

const bodyPostSignoutSchema = Type.Object({
  refreshToken: jwtSchema.refreshToken
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
      try {
        const userRefreshJWT = jwt.verify(
          refreshToken,
          JWT_REFRESH_SECRET
        ) as UserRefreshJWT
        const foundRefreshToken = await prisma.refreshToken.findFirst({
          where: { token: userRefreshJWT.tokenUUID }
        })
        if (foundRefreshToken == null) {
          throw fastify.httpErrors.notFound()
        }
        await prisma.refreshToken.delete({
          where: {
            id: foundRefreshToken.id
          }
        })
        reply.statusCode = 200
        return {}
      } catch {
        throw fastify.httpErrors.notFound()
      }
    }
  })
}
