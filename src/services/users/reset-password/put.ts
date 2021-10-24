import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'
import bcrypt from 'bcryptjs'

import prisma from '../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../models/utils.js'
import { userSchema } from '../../../models/User.js'

const bodyPutResetPasswordSchema = Type.Object({
  password: userSchema.password,
  temporaryToken: userSchema.temporaryToken
})

type BodyPutResetPasswordSchemaType = Static<typeof bodyPutResetPasswordSchema>

const putResetPasswordSchema: FastifySchema = {
  description:
    'Change the user password if the provided temporaryToken (sent in the email of POST /users/reset-password) is correct.',
  tags: ['users'] as string[],
  body: bodyPutResetPasswordSchema,
  response: {
    200: Type.String(),
    400: fastifyErrors[400],
    500: fastifyErrors[500]
  }
} as const

export const putResetPasswordUser: FastifyPluginAsync = async (fastify) => {
  fastify.route<{
    Body: BodyPutResetPasswordSchemaType
  }>({
    method: 'PUT',
    url: '/users/reset-password',
    schema: putResetPasswordSchema,
    handler: async (request, reply) => {
      const { password, temporaryToken } = request.body
      const user = await prisma.user.findFirst({ where: { temporaryToken } })
      const isValidTemporaryToken =
        user?.temporaryExpirationToken != null &&
        user.temporaryExpirationToken.getTime() > Date.now()
      if (user == null || !isValidTemporaryToken) {
        throw fastify.httpErrors.badRequest('"tempToken" is invalid')
      }
      const hashedPassword = await bcrypt.hash(password, 12)
      await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          password: hashedPassword,
          temporaryToken: null,
          temporaryExpirationToken: null
        }
      })
      reply.statusCode = 200
      return 'The new password has been saved!'
    }
  })
}
