import { randomUUID } from 'node:crypto'

import { Static, Type } from '@sinclair/typebox'
import bcrypt from 'bcryptjs'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../tools/database/prisma'
import { fastifyErrors } from '../../../models/utils'
import {
  bodyUserSchema,
  BodyUserSchemaType,
  userPublicSchema
} from '../../../models/User'
import { sendEmail } from '../../../tools/email/sendEmail'

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
  fastify.route<{
    Body: BodyUserSchemaType
    Params: QueryPostSignupSchemaType
  }>({
    method: 'POST',
    url: '/users/signup',
    schema: postSignupSchema,
    handler: async (request, reply) => {
      const { name, email, password, theme, language } = request.body
      const { redirectURI } = request.params
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
        url: `${request.protocol}://${process.env.HOST}:${process.env.PORT}/users/confirm-email?temporaryToken=${temporaryToken}${redirectQuery}`,
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
