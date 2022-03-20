import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import { HOST, PORT } from '../../../../../tools/configurations/index.js'
import { fastifyErrors } from '../../../../../models/utils.js'
import { githubStrategy, getGitHubUserData } from '../__utils__/utils.js'
import { buildQueryURL } from '../../../../../tools/utils/buildQueryURL.js'

const querySchema = Type.Object({
  code: Type.String(),
  redirectURI: Type.String({ format: 'uri-reference' })
})

type QuerySchemaType = Static<typeof querySchema>

const getServiceSchema: FastifySchema = {
  description: 'GitHub OAuth2 - callback',
  tags: ['users'] as string[],
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
        `${request.protocol}://${HOST}:${PORT}/users/oauth2/github/callback?redirectURI=${redirectURI}`
      )
      const responseJWT = await githubStrategy.callbackSignin({
        name: githubUser.name,
        id: githubUser.id
      })
      return await reply.redirect(buildQueryURL(redirectURI, responseJWT))
    }
  })
}