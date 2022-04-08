import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import { API_URL } from '../../../../../tools/configurations/index.js'
import { fastifyErrors } from '../../../../../models/utils.js'
import { GITHUB_BASE_URL, GITHUB_CLIENT_ID } from '../__utils__/utils.js'
import authenticateUser from '../../../../../tools/plugins/authenticateUser.js'

const querySchema = Type.Object({
  redirectURI: Type.String({ format: 'uri-reference' })
})

type QuerySchemaType = Static<typeof querySchema>

const getServiceSchema: FastifySchema = {
  description: 'GitHub OAuth2 - add-strategy',
  tags: ['users'] as string[],
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

export const getAddStrategyGitHubOAuth2Service: FastifyPluginAsync = async (
  fastify
) => {
  await fastify.register(authenticateUser)

  await fastify.route<{
    Querystring: QuerySchemaType
  }>({
    method: 'GET',
    url: '/users/oauth2/github/add-strategy',
    schema: getServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { redirectURI } = request.query
      const redirectCallback = `${API_URL}/users/oauth2/github/callback-add-strategy?redirectURI=${redirectURI}`
      const url = `${GITHUB_BASE_URL}/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&state=${request.user.accessToken}&redirect_uri=${redirectCallback}`
      reply.statusCode = 200
      return url
    }
  })
}