import type { Static } from "@sinclair/typebox"
import { Type } from "@sinclair/typebox"
import type { FastifyPluginAsync, FastifySchema } from "fastify"

import { API_URL } from "#src/tools/configurations.js"
import { fastifyErrors } from "#src/models/utils.js"
import { discordStrategy, getDiscordUserData } from "../__utils__/utils.js"
import { buildQueryURL } from "#src/tools/utils/buildQueryURL.js"

const querySchema = Type.Object({
  code: Type.String(),
  redirectURI: Type.String({ format: "uri-reference" }),
})

type QuerySchemaType = Static<typeof querySchema>

const getServiceSchema: FastifySchema = {
  description: "Discord OAuth2 - callback",
  tags: ["oauth2"] as string[],
  querystring: querySchema,
  response: {
    200: Type.String(),
    400: fastifyErrors[400],
    500: fastifyErrors[500],
  },
} as const

export const getCallbackDiscordOAuth2Service: FastifyPluginAsync = async (
  fastify,
) => {
  await fastify.route<{
    Querystring: QuerySchemaType
  }>({
    method: "GET",
    url: "/users/oauth2/discord/callback",
    schema: getServiceSchema,
    handler: async (request, reply) => {
      const { redirectURI, code } = request.query
      const discordUser = await getDiscordUserData(
        code,
        `${API_URL}/users/oauth2/discord/callback?redirectURI=${redirectURI}`,
      )
      const responseJWT = await discordStrategy.callbackSignin({
        name: discordUser.username,
        id: discordUser.id,
      })
      return await reply.redirect(buildQueryURL(redirectURI, responseJWT))
    },
  })
}
