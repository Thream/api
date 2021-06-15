import path from 'path'

import { FastifyPluginAsync, FastifySchema } from 'fastify'
import { Static, Type } from '@sinclair/typebox'

const paramsUploadsSchema = Type.Object({
  image: Type.String()
})

type ParamsUploadsSchemaType = Static<typeof paramsUploadsSchema>

const getUploadsSchema: FastifySchema = {
  tags: ['uploads'] as string[],
  params: paramsUploadsSchema
} as const

export const uploadsService: FastifyPluginAsync = async (fastify) => {
  fastify.route<{ Params: ParamsUploadsSchemaType }>({
    method: 'GET',
    url: '/uploads/users/:image',
    schema: getUploadsSchema,
    handler: async (request, reply) => {
      const { image } = request.params
      return await reply.sendFile(path.join('users', image))
    }
  })
}
