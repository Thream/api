import path from 'node:path'

import { FastifyPluginAsync, FastifySchema } from 'fastify'
import { Static, Type } from '@sinclair/typebox'

import { fastifyErrors } from '../../../models/utils.js'

const parameters = Type.Object({
  file: Type.String()
})

type Parameters = Static<typeof parameters>

export const getServiceSchema: FastifySchema = {
  tags: ['uploads'] as string[],
  params: parameters,
  response: {
    200: {
      type: 'string',
      format: 'binary'
    },
    400: fastifyErrors[400],
    404: fastifyErrors[404],
    500: fastifyErrors[500]
  }
} as const

export const getGuildsUploadsService: FastifyPluginAsync = async (fastify) => {
  await fastify.route<{
    Params: Parameters
  }>({
    method: 'GET',
    url: '/uploads/guilds/:file',
    schema: getServiceSchema,
    handler: async (request, reply) => {
      const { file } = request.params
      return await reply.sendFile(path.join('guilds', file))
    }
  })
}
