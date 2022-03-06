import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import { HOST, PORT } from '../../../../../tools/configurations/index.js'
import { fastifyErrors } from '../../../../../models/utils.js'
import { DISCORD_BASE_URL, DISCORD_CLIENT_ID } from '../__utils__/utils.js'

const querySchema = Type.Object({
  redirectURI: Type.String({ format: 'uri-reference' })
})

type QuerySchemaType = Static<typeof querySchema>

const getServiceSchema: FastifySchema = {
  description: 'Discord OAuth2 - signin',
  tags: ['users'] as string[],
  querystring: querySchema,
  response: {
    200: Type.String(),
    400: fastifyErrors[400],
    500: fastifyErrors[500]
  }
} as const

export const getSigninDiscordOAuth2Service: FastifyPluginAsync = async (
  fastify
) => {
  await fastify.route<{
    Querystring: QuerySchemaType
  }>({
    method: 'GET',
    url: '/users/oauth2/discord/signin',
    schema: getServiceSchema,
    handler: async (request, reply) => {
      const { redirectURI } = request.query
      const redirectCallback = `${request.protocol}://${HOST}:${PORT}/users/oauth2/discord/callback?redirectURI=${redirectURI}`
      const url = `${DISCORD_BASE_URL}/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirectCallback}`
      reply.statusCode = 200
      return url
    }
  })
}
