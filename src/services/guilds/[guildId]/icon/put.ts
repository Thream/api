import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import authenticateUser from '../../../../tools/plugins/authenticateUser.js'
import { fastifyErrors } from '../../../../models/utils.js'
import fastifyMultipart from 'fastify-multipart'
import prisma from '../../../../tools/database/prisma.js'
import { uploadImage } from '../../../../tools/utils/uploadImage.js'
import { guildSchema } from '../../../../models/Guild.js'

const parametersSchema = Type.Object({
  guildId: guildSchema.id
})

type Parameters = Static<typeof parametersSchema>

const putServiceSchema: FastifySchema = {
  description: 'Edit the icon of the guild with its id',
  tags: ['guilds'] as string[],
  consumes: ['multipart/form-data'] as string[],
  produces: ['application/json'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  params: parametersSchema,
  response: {
    200: Type.Object({
      guild: Type.Object({
        icon: Type.String()
      })
    }),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    404: fastifyErrors[404],
    431: fastifyErrors[431],
    500: fastifyErrors[500]
  }
} as const

export const putGuildIconById: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  await fastify.register(fastifyMultipart)

  fastify.route<{
    Params: Parameters
  }>({
    method: 'PUT',
    url: '/guilds/:guildId/icon',
    schema: putServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { guildId } = request.params
      const guild = await prisma.guild.findUnique({ where: { id: guildId } })
      if (guild == null) {
        throw fastify.httpErrors.notFound()
      }
      const icon = await uploadImage({
        fastify,
        request,
        folderInUploadsFolder: 'guilds'
      })
      await prisma.guild.update({
        where: { id: guildId },
        data: { icon }
      })
      reply.statusCode = 200
      return {
        guild: {
          icon
        }
      }
    }
  })
}
