import { Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../tools/database/prisma'
import { fastifyErrors } from '../../../models/utils'
import authenticateUser from '../../../tools/plugins/authenticateUser'
import { userPublicSchema } from '../../../models/User'
import { strategiesTypebox } from '../../../models/OAuth'

const getCurrentUserSchema: FastifySchema = {
  description: 'GET the current connected user',
  tags: ['users'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  response: {
    200: Type.Object({
      user: Type.Object({
        ...userPublicSchema,
        currentStrategy: Type.Union([...strategiesTypebox]),
        strategies: Type.Array(Type.Union([...strategiesTypebox]))
      })
    }),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    500: fastifyErrors[500]
  }
} as const

export const getCurrentUser: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route({
    method: 'GET',
    url: '/users/current',
    schema: getCurrentUserSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const settings = await prisma.userSetting.findFirst({
        where: { userId: request.user.current.id }
      })
      const OAuths = await prisma.oAuth.findMany({
        where: { userId: request.user.current.id }
      })
      const strategies = OAuths.map((oauth) => {
        return oauth.provider
      })
      if (request.user.current.password != null) {
        strategies.push('local')
      }
      reply.statusCode = 200
      return {
        user: {
          ...request.user.current,
          settings,
          currentStrategy: request.user.currentStrategy,
          strategies
        }
      }
    }
  })
}
