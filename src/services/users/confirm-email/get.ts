import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../models/utils.js'
import { userSchema } from '../../../models/User.js'

const queryGetConfirmEmailSchema = Type.Object({
  redirectURI: Type.Optional(Type.String({ format: 'uri-reference' })),
  temporaryToken: userSchema.temporaryToken
})

type QueryGetConfirmEmailSchemaType = Static<typeof queryGetConfirmEmailSchema>

const getConfirmEmailSchema: FastifySchema = {
  description: 'Confirm the account of the user.',
  tags: ['users'] as string[],
  querystring: queryGetConfirmEmailSchema,
  response: {
    200: Type.String(),
    400: fastifyErrors[400],
    403: fastifyErrors[403],
    500: fastifyErrors[500]
  }
} as const

export const getConfirmEmail: FastifyPluginAsync = async (fastify) => {
  await fastify.route<{
    Querystring: QueryGetConfirmEmailSchemaType
  }>({
    method: 'GET',
    url: '/users/confirm-email',
    schema: getConfirmEmailSchema,
    handler: async (request, reply) => {
      const { redirectURI, temporaryToken } = request.query
      const user = await prisma.user.findFirst({
        where: {
          temporaryToken,
          isConfirmed: false
        }
      })
      if (user == null) {
        throw fastify.httpErrors.forbidden()
      }
      await prisma.user.update({
        where: { id: user.id },
        data: {
          temporaryToken: null,
          isConfirmed: true
        }
      })
      if (redirectURI == null) {
        reply.statusCode = 200
        return 'Success, your email has been confirmed, you can now signin!'
      }
      await reply.redirect(redirectURI)
    }
  })
}
