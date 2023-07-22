import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import { API_URL } from '#src/tools/configurations.js'
import { fastifyErrors } from '#src/models/utils.js'
import { githubStrategy, getGitHubUserData } from '../__utils__/utils.js'
import { buildQueryURL } from '#src/tools/utils/buildQueryURL.js'

const querySchema = Type.Object({
  code: Type.String(),
  redirectURI: Type.String({ format: 'uri-reference' })
})

type QuerySchemaType = Static<typeof querySchema>

const getServiceSchema: FastifySchema = {
  description: 'GitHub OAuth2 - callback',
  tags: ['oauth2'] as string[],
  querystring: querySchema,
  response: {
    200: Type.String(),
    400: fastifyErrors[400],
    500: fastifyErrors[500]
  }
} as const

export const getCallbackGitHubOAuth2Service: FastifyPluginAsync = async (
  fastify
) => {
  await fastify.route<{
    Querystring: QuerySchemaType
  }>({
    method: 'GET',
    url: '/users/oauth2/github/callback',
    schema: getServiceSchema,
    handler: async (request, reply) => {
      const { redirectURI, code } = request.query
      const githubUser = await getGitHubUserData(
        code,
        `${API_URL}/users/oauth2/github/callback?redirectURI=${redirectURI}`
      )
      const responseJWT = await githubStrategy.callbackSignin({
        name: githubUser.name,
        id: githubUser.id
      })
      return await reply.redirect(buildQueryURL(redirectURI, responseJWT))
    }
  })
}
