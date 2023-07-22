import { randomUUID } from 'node:crypto'

import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import bcrypt from 'bcryptjs'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '#src/tools/database/prisma.js'
import { fastifyErrors } from '#src/models/utils.js'
import type { BodyUserSchemaType } from '#src/models/User.js'
import { bodyUserSchema, userPublicSchema } from '#src/models/User.js'
import { sendEmail } from '#src/tools/email/sendEmail.js'
import { API_URL } from '#src/tools/configurations.js'

const queryPostSignupSchema = Type.Object({
  redirectURI: Type.Optional(Type.String({ format: 'uri-reference' }))
})

type QueryPostSignupSchemaType = Static<typeof queryPostSignupSchema>

const postSignupSchema: FastifySchema = {
  description:
    'Allows a new user to signup, if success he would need to confirm his email.',
  tags: ['users'] as string[],
  body: bodyUserSchema,
  querystring: queryPostSignupSchema,
  response: {
    201: Type.Object({ user: Type.Object(userPublicSchema) }),
    400: fastifyErrors[400],
    500: fastifyErrors[500]
  }
} as const

export const postSignupUser: FastifyPluginAsync = async (fastify) => {
  await fastify.route<{
    Body: BodyUserSchemaType
    Querystring: QueryPostSignupSchemaType
  }>({
    method: 'POST',
    url: '/users/signup',
    schema: postSignupSchema,
    handler: async (request, reply) => {
      const { name, email, password, theme, language } = request.body
      const { redirectURI } = request.query
      const userValidation = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { name }]
        }
      })
      if (userValidation != null) {
        throw fastify.httpErrors.badRequest(
          'body.email or body.name already taken.'
        )
      }
      const hashedPassword = await bcrypt.hash(password, 12)
      const temporaryToken = randomUUID()
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          temporaryToken
        }
      })
      const userSettings = await prisma.userSetting.create({
        data: {
          userId: user.id,
          theme,
          language
        }
      })
      const redirectQuery =
        redirectURI != null ? `&redirectURI=${redirectURI}` : ''
      await sendEmail({
        type: 'confirm-email',
        email,
        url: `${API_URL}/users/confirm-email?temporaryToken=${temporaryToken}${redirectQuery}`,
        language,
        theme
      })
      reply.statusCode = 201
      return {
        user: {
          ...user,
          settings: { ...userSettings }
        }
      }
    }
  })
}
