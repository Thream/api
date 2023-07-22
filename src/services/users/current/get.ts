import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '#src/tools/database/prisma.js'
import { fastifyErrors } from '#src/models/utils.js'
import authenticateUser from '#src/tools/plugins/authenticateUser.js'
import { userCurrentSchema } from '#src/models/User.js'

const getCurrentUserSchema: FastifySchema = {
  description: 'GET the current connected user',
  tags: ['users'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  response: {
    200: userCurrentSchema,
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
      const { user } = request
      const settings = await prisma.userSetting.findFirst({
        where: { userId: user.current.id }
      })
      const OAuths = await prisma.oAuth.findMany({
        where: { userId: user.current.id }
      })
      const strategies = OAuths.map((oauth) => {
        return oauth.provider
      })
      if (user.current.password != null) {
        strategies.push('Local')
      }
      reply.statusCode = 200
      return {
        user: {
          ...user.current,
          settings,
          currentStrategy: user.currentStrategy,
          strategies
        }
      }
    }
  })
}
