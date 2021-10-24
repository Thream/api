import path from 'node:path'

import { FastifyPluginAsync, FastifySchema } from 'fastify'
import { Static, Type } from '@sinclair/typebox'

const parametersUploadsSchema = Type.Object({
  image: Type.String()
})

type ParametersUploadsSchemaType = Static<typeof parametersUploadsSchema>

const getUploadsSchema: FastifySchema = {
  tags: ['uploads'] as string[],
  params: parametersUploadsSchema
} as const

export const uploadsService: FastifyPluginAsync = async (fastify) => {
  fastify.route<{ Params: ParametersUploadsSchemaType }>({
    method: 'GET',
    url: '/uploads/users/:image',
    schema: getUploadsSchema,
    handler: async (request, reply) => {
      const { image } = request.params
      return await reply.sendFile(path.join('users', image))
    }
  })
}
