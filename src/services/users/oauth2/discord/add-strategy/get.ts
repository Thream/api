import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import { API_URL } from '../../../../../tools/configurations/index.js'
import { fastifyErrors } from '../../../../../models/utils.js'
import { DISCORD_BASE_URL, DISCORD_CLIENT_ID } from '../__utils__/utils.js'
import authenticateUser from '../../../../../tools/plugins/authenticateUser.js'

const querySchema = Type.Object({
  redirectURI: Type.String({ format: 'uri-reference' })
})

type QuerySchemaType = Static<typeof querySchema>

const getServiceSchema: FastifySchema = {
  description: 'Discord OAuth2 - add-strategy',
  tags: ['oauth2'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  querystring: querySchema,
  response: {
    200: Type.String(),
    400: fastifyErrors[400],
    500: fastifyErrors[500]
  }
} as const

export const getAddStrategyDiscordOAuth2Service: FastifyPluginAsync = async (
  fastify
) => {
  await fastify.register(authenticateUser)

  await fastify.route<{
    Querystring: QuerySchemaType
  }>({
    method: 'GET',
    url: '/users/oauth2/discord/add-strategy',
    schema: getServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { redirectURI } = request.query
      const redirectCallback = `${API_URL}/users/oauth2/discord/callback-add-strategy?redirectURI=${redirectURI}`
      const url = `${DISCORD_BASE_URL}/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=identify&response_type=code&state=${request.user.accessToken}&redirect_uri=${redirectCallback}`
      reply.statusCode = 200
      return url
    }
  })
}
