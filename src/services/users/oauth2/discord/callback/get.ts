import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import { API_URL } from '../../../../../tools/configurations/index.js'
import { fastifyErrors } from '../../../../../models/utils.js'
import { discordStrategy, getDiscordUserData } from '../__utils__/utils.js'
import { buildQueryURL } from '../../../../../tools/utils/buildQueryURL.js'

const querySchema = Type.Object({
  code: Type.String(),
  redirectURI: Type.String({ format: 'uri-reference' })
})

type QuerySchemaType = Static<typeof querySchema>

const getServiceSchema: FastifySchema = {
  description: 'Discord OAuth2 - callback',
  tags: ['users'] as string[],
  querystring: querySchema,
  response: {
    200: Type.String(),
    400: fastifyErrors[400],
    500: fastifyErrors[500]
  }
} as const

export const getCallbackDiscordOAuth2Service: FastifyPluginAsync = async (
  fastify
) => {
  await fastify.route<{
    Querystring: QuerySchemaType
  }>({
    method: 'GET',
    url: '/users/oauth2/discord/callback',
    schema: getServiceSchema,
    handler: async (request, reply) => {
      const { redirectURI, code } = request.query
      const discordUser = await getDiscordUserData(
        code,
        `${API_URL}/users/oauth2/discord/callback?redirectURI=${redirectURI}`
      )
      const responseJWT = await discordStrategy.callbackSignin({
        name: discordUser.username,
        id: discordUser.id
      })
      return await reply.redirect(buildQueryURL(redirectURI, responseJWT))
    }
  })
}
