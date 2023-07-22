import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import { API_URL } from '#src/tools/configurations.js'
import { fastifyErrors } from '#src/models/utils.js'
import { GOOGLE_BASE_URL, GOOGLE_CLIENT_ID } from '../__utils__/utils.js'

const querySchema = Type.Object({
  redirectURI: Type.String({ format: 'uri-reference' })
})

type QuerySchemaType = Static<typeof querySchema>

const getServiceSchema: FastifySchema = {
  description: 'Google OAuth2 - signin',
  tags: ['oauth2'] as string[],
  querystring: querySchema,
  response: {
    200: Type.String(),
    400: fastifyErrors[400],
    500: fastifyErrors[500]
  }
} as const

export const getSigninGoogleOAuth2Service: FastifyPluginAsync = async (
  fastify
) => {
  await fastify.route<{
    Querystring: QuerySchemaType
  }>({
    method: 'GET',
    url: '/users/oauth2/google/signin',
    schema: getServiceSchema,
    handler: async (request, reply) => {
      const { redirectURI } = request.query
      const redirectCallback = `${API_URL}/users/oauth2/google/callback?redirectURI=${redirectURI}`
      const url = `${GOOGLE_BASE_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectCallback}&response_type=code&scope=profile&access_type=online`
      reply.statusCode = 200
      return url
    }
  })
}
