import { randomUUID } from 'node:crypto'

import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../models/utils.js'
import authenticateUser from '../../../tools/plugins/authenticateUser.js'
import { userCurrentSchema, userSchema } from '../../../models/User.js'
import { sendEmail } from '../../../tools/email/sendEmail.js'
import { HOST, PORT } from '../../../tools/configurations/index.js'
import { Language, Theme } from '../../../models/UserSettings.js'
import { parseStringNullish } from '../../../tools/utils/parseStringNullish.js'

const bodyPutServiceSchema = Type.Object({
  name: Type.Optional(userSchema.name),
  email: Type.Optional(Type.Union([userSchema.email, Type.Null()])),
  status: Type.Optional(Type.Union([userSchema.status, Type.Null()])),
  biography: Type.Optional(Type.Union([userSchema.biography, Type.Null()])),
  website: Type.Optional(Type.Union([userSchema.website, Type.Null()]))
})

type BodyPutServiceSchemaType = Static<typeof bodyPutServiceSchema>

const queryPutCurrentUserSchema = Type.Object({
  redirectURI: Type.Optional(Type.String({ format: 'uri-reference' }))
})

type QueryPutCurrentUserSchemaType = Static<typeof queryPutCurrentUserSchema>

const putServiceSchema: FastifySchema = {
  description: 'Edit the current connected user information',
  tags: ['users'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  body: bodyPutServiceSchema,
  querystring: queryPutCurrentUserSchema,
  response: {
    200: userCurrentSchema,
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    500: fastifyErrors[500]
  }
} as const

export const putCurrentUser: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Body: BodyPutServiceSchemaType
    Params: QueryPutCurrentUserSchemaType
  }>({
    method: 'PUT',
    url: '/users/current',
    schema: putServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { name, email, status, biography, website } = request.body
      const { redirectURI } = request.params
      const userValidation = await prisma.user.findFirst({
        where: {
          OR: [
            ...(email != null ? [{ email }] : [{}]),
            ...(name != null ? [{ name }] : [{}])
          ],
          AND: [{ id: { not: request.user.current.id } }]
        }
      })
      if (userValidation != null) {
        throw fastify.httpErrors.badRequest(
          'body.email or body.name already taken.'
        )
      }
      const settings = await prisma.userSetting.findFirst({
        where: { userId: request.user.current.id }
      })
      if (settings == null) {
        throw fastify.httpErrors.internalServerError()
      }
      const OAuths = await prisma.oAuth.findMany({
        where: { userId: request.user.current.id }
      })
      const strategies = OAuths.map((oauth) => {
        return oauth.provider
      })
      if (request.user.current.password != null) {
        strategies.push('local')
      }
      if (email === null && strategies.includes('local')) {
        throw fastify.httpErrors.badRequest(
          'You must have an email to sign in.'
        )
      }
      if (email != null && email !== request.user.current.email) {
        await prisma.refreshToken.deleteMany({
          where: {
            userId: request.user.current.id
          }
        })
        const temporaryToken = randomUUID()
        const redirectQuery =
          redirectURI != null ? `&redirectURI=${redirectURI}` : ''
        await sendEmail({
          type: 'confirm-email',
          email,
          url: `${request.protocol}://${HOST}:${PORT}/users/confirm-email?temporaryToken=${temporaryToken}${redirectQuery}`,
          language: settings.language as Language,
          theme: settings.theme as Theme
        })
        await prisma.user.update({
          where: { id: request.user.current.id },
          data: {
            email,
            temporaryToken,
            isConfirmed: false
          }
        })
      }
      const user = await prisma.user.update({
        where: { id: request.user.current.id },
        data: {
          name: name ?? request.user.current.name,
          status: parseStringNullish(request.user.current.status, status),
          biography: parseStringNullish(
            request.user.current.biography,
            biography
          ),
          website: parseStringNullish(request.user.current.website, website)
        }
      })
      await fastify.io.emitToAuthorizedUsers({
        event: 'users',
        isAuthorizedCallback: () => true,
        payload: {
          action: 'update',
          item: user
        }
      })
      reply.statusCode = 200
      return {
        user: {
          ...user,
          settings,
          currentStrategy: request.user.currentStrategy,
          strategies
        }
      }
    }
  })
}
