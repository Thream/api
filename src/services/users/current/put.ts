import { randomUUID } from "node:crypto"

import type { Static } from "@sinclair/typebox"
import { Type } from "@sinclair/typebox"
import type { FastifyPluginAsync, FastifySchema } from "fastify"

import prisma from "#src/tools/database/prisma.js"
import { fastifyErrors } from "#src/models/utils.js"
import authenticateUser from "#src/tools/plugins/authenticateUser.js"
import { userCurrentSchema, userSchema } from "#src/models/User.js"
import { sendEmail } from "#src/tools/email/sendEmail.js"
import { API_URL } from "#src/tools/configurations.js"
import type { Language, Theme } from "#src/models/UserSettings.js"
import { parseStringNullish } from "#src/tools/utils/parseStringNullish.js"

const bodyPutServiceSchema = Type.Object({
  name: Type.Optional(userSchema.name),
  email: Type.Optional(Type.Union([userSchema.email, Type.Null()])),
  status: Type.Optional(Type.Union([userSchema.status, Type.Null()])),
  biography: Type.Optional(Type.Union([userSchema.biography, Type.Null()])),
  website: Type.Optional(Type.Union([userSchema.website, Type.Null()])),
})

type BodyPutServiceSchemaType = Static<typeof bodyPutServiceSchema>

const queryPutCurrentUserSchema = Type.Object({
  redirectURI: Type.Optional(Type.String({ format: "uri-reference" })),
})

type QueryPutCurrentUserSchemaType = Static<typeof queryPutCurrentUserSchema>

const putServiceSchema: FastifySchema = {
  description: "Edit the current connected user information",
  tags: ["users"] as string[],
  security: [
    {
      bearerAuth: [],
    },
  ] as Array<{ [key: string]: [] }>,
  body: bodyPutServiceSchema,
  querystring: queryPutCurrentUserSchema,
  response: {
    200: userCurrentSchema,
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    500: fastifyErrors[500],
  },
} as const

export const putCurrentUser: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Body: BodyPutServiceSchemaType
    Querystring: QueryPutCurrentUserSchemaType
  }>({
    method: "PUT",
    url: "/users/current",
    schema: putServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { name, email, status, biography, website } = request.body
      const { redirectURI } = request.query
      const userValidation = await prisma.user.findFirst({
        where: {
          OR: [
            ...(email != null ? [{ email }] : [{}]),
            ...(name != null ? [{ name }] : [{}]),
          ],
          AND: [{ id: { not: request.user.current.id } }],
        },
      })
      if (userValidation != null) {
        throw fastify.httpErrors.badRequest(
          "body.email or body.name already taken.",
        )
      }
      const settings = await prisma.userSetting.findFirst({
        where: { userId: request.user.current.id },
      })
      if (settings == null) {
        throw fastify.httpErrors.internalServerError()
      }
      const OAuths = await prisma.oAuth.findMany({
        where: { userId: request.user.current.id },
      })
      const strategies = OAuths.map((oauth) => {
        return oauth.provider
      })
      if (request.user.current.password != null) {
        strategies.push("Local")
      }
      if (email === null && strategies.includes("Local")) {
        throw fastify.httpErrors.badRequest(
          "You must have an email to sign in.",
        )
      }
      if (email != null && email !== request.user.current.email) {
        await prisma.refreshToken.deleteMany({
          where: {
            userId: request.user.current.id,
          },
        })
        const temporaryToken = randomUUID()
        const redirectQuery =
          redirectURI != null ? `&redirectURI=${redirectURI}` : ""
        await sendEmail({
          type: "confirm-email",
          email,
          url: `${API_URL}/users/confirm-email?temporaryToken=${temporaryToken}${redirectQuery}`,
          language: settings.language as Language,
          theme: settings.theme as Theme,
        })
        await prisma.user.update({
          where: { id: request.user.current.id },
          data: {
            email,
            temporaryToken,
            isConfirmed: false,
          },
        })
      }
      const user = await prisma.user.update({
        where: { id: request.user.current.id },
        data: {
          name: name ?? request.user.current.name,
          status: parseStringNullish(request.user.current.status, status),
          biography: parseStringNullish(
            request.user.current.biography,
            biography,
          ),
          website: parseStringNullish(request.user.current.website, website),
        },
      })
      await fastify.io.emitToAuthorizedUsers({
        event: "users",
        isAuthorizedCallback: () => {
          return true
        },
        payload: {
          action: "update",
          item: user,
        },
      })
      reply.statusCode = 200
      return {
        user: {
          ...user,
          settings,
          currentStrategy: request.user.currentStrategy,
          strategies,
        },
      }
    },
  })
}
