import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import prisma from '../../../../../tools/database/prisma.js'
import { fastifyErrors } from '../../../../../models/utils.js'
import authenticateUser from '../../../../../tools/plugins/authenticateUser.js'
import { guildSchema } from '../../../../../models/Guild.js'
import { memberSchema } from '../../../../../models/Member.js'

const parametersSchema = Type.Object({
  guildId: guildSchema.id
})

type Parameters = Static<typeof parametersSchema>

const deleteServiceSchema: FastifySchema = {
  description: 'Leave a guild (delete a member).',
  tags: ['members'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  params: parametersSchema,
  response: {
    200: Type.Object(memberSchema),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    404: fastifyErrors[404],
    500: fastifyErrors[500]
  }
} as const

export const deleteMemberService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Params: Parameters
  }>({
    method: 'DELETE',
    url: '/guilds/:guildId/members/leave',
    schema: deleteServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { user } = request
      const { guildId } = request.params
      const member = await prisma.member.findFirst({
        where: { guildId, userId: user.current.id }
      })
      if (member == null) {
        throw fastify.httpErrors.notFound('Member not found')
      }
      if (member.isOwner) {
        throw fastify.httpErrors.badRequest(
          "The member owner can't leave the guild (you can delete it instead)"
        )
      }
      await prisma.member.delete({ where: { id: member.id } })
      await fastify.io.emitToMembers({
        event: 'members',
        guildId,
        payload: {
          action: 'delete',
          item: member
        }
      })
      reply.statusCode = 200
      return member
    }
  })
}
