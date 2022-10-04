import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../../models/utils.js'
import authenticateUser from '../../../../tools/plugins/authenticateUser.js'
import { oauthSchema } from '../../../../models/OAuth.js'

const parametersSchema = Type.Object({
  provider: oauthSchema.provider
})

type Parameters = Static<typeof parametersSchema>

const deleteServiceSchema: FastifySchema = {
  description: 'DELETE a provider to authenticate with for a user.',
  tags: ['oauth2'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  params: parametersSchema,
  response: {
    200: Type.Object(oauthSchema),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    404: fastifyErrors[404],
    500: fastifyErrors[500]
  }
} as const

export const deleteProviderService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Params: Parameters
  }>({
    method: 'DELETE',
    url: '/users/oauth2/:provider',
    schema: deleteServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { user } = request
      const { provider } = request.params
      const OAuths = await prisma.oAuth.findMany({
        where: { userId: user.current.id }
      })
      const strategies = OAuths.map((oauth) => {
        return oauth.provider
      })
      if (user.current.password != null) {
        strategies.push('Local')
      }
      const oauthProvider = OAuths.find((oauth) => {
        return oauth.provider === provider
      })
      if (oauthProvider == null) {
        throw fastify.httpErrors.notFound('You are not using this provider')
      }
      const hasOthersWayToAuthenticate = strategies.length >= 2
      if (!hasOthersWayToAuthenticate) {
        throw fastify.httpErrors.badRequest(
          "You can't delete your only way to authenticate"
        )
      }
      const oauthProviderDelete = await prisma.oAuth.delete({
        where: { id: oauthProvider.id }
      })
      reply.statusCode = 200
      return oauthProviderDelete
    }
  })
}
