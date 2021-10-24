import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'
import jwt from 'jsonwebtoken'

import prisma from '../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../models/utils.js'
import {
  generateAccessToken,
  jwtSchema,
  expiresIn
} from '../../../tools/utils/jwtToken.js'
import { UserJWT } from '../../../models/User.js'
import { JWT_REFRESH_SECRET } from '../../../tools/configurations/index.js'

const bodyPostRefreshTokenSchema = Type.Object({
  refreshToken: jwtSchema.refreshToken
})

type BodyPostRefreshTokenSchemaType = Static<typeof bodyPostRefreshTokenSchema>

const postRefreshTokenSchema: FastifySchema = {
  description: 'Refresh the accessToken of the user',
  tags: ['users'] as string[],
  body: bodyPostRefreshTokenSchema,
  response: {
    200: Type.Object({
      accessToken: jwtSchema.accessToken,
      expiresIn: jwtSchema.expiresIn,
      type: jwtSchema.type
    }),
    400: fastifyErrors[400],
    403: fastifyErrors[403],
    500: fastifyErrors[500]
  }
} as const

export const postRefreshTokenUser: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Body: BodyPostRefreshTokenSchemaType
  }>({
    method: 'POST',
    url: '/users/refresh-token',
    schema: postRefreshTokenSchema,
    handler: async (request, reply) => {
      const { refreshToken } = request.body
      const foundRefreshToken = await prisma.refreshToken.findFirst({
        where: { token: refreshToken }
      })
      if (foundRefreshToken == null) {
        throw fastify.httpErrors.forbidden()
      }
      try {
        const userJWT = jwt.verify(
          foundRefreshToken.token,
          JWT_REFRESH_SECRET
        ) as UserJWT
        const accessToken = generateAccessToken({
          id: userJWT.id,
          currentStrategy: 'local'
        })
        reply.statusCode = 200
        return {
          accessToken,
          expiresIn,
          type: 'Bearer'
        }
      } catch {
        throw fastify.httpErrors.forbidden()
      }
    }
  })
}
