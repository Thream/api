import { randomUUID } from 'crypto'

import { Static, Type } from '@sinclair/typebox'
import bcrypt from 'bcryptjs'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../tools/database/prisma'
import { id, date, fastifyErrors } from '../../../models/utils'
import {
  bodyUserSchema,
  BodyUserSchemaType,
  userSchema
} from '../../../models/User'
import { userSettingsSchema } from '../../../models/UserSettings'
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
    201: Type.Object({
      id,
      name: userSchema.name,
      email: userSchema.email,
      logo: Type.Union([userSchema.logo, Type.Null()]),
      status: Type.Union([userSchema.status, Type.Null()]),
      biography: Type.Union([userSchema.biography, Type.Null()]),
      isConfirmed: userSchema.isConfirmed,
      createdAt: date.createdAt,
      updatedAt: date.updatedAt,
      settings: Type.Object(userSettingsSchema)
    }),
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
        ...user,
        settings: { ...userSettings }
      }
    }
  })
}
