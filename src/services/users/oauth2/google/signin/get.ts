import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import { HOST, PORT } from '../../../../../tools/configurations/index.js'
import { fastifyErrors } from '../../../../../models/utils.js'
import { GOOGLE_BASE_URL, GOOGLE_CLIENT_ID } from '../__utils__/utils.js'

const querySchema = Type.Object({
  redirectURI: Type.String({ format: 'uri-reference' })
})

type QuerySchemaType = Static<typeof querySchema>

const getServiceSchema: FastifySchema = {
  description: 'Google OAuth2 - signin',
  tags: ['users'] as string[],
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
      const redirectCallback = `${request.protocol}://${HOST}:${PORT}/users/oauth2/google/callback?redirectURI=${redirectURI}`
      const url = `${GOOGLE_BASE_URL}?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectCallback}&response_type=code&scope=profile&access_type=online`
      reply.statusCode = 200
      return url
    }
  })
}
