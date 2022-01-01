import path from 'node:path'

import { FastifyPluginAsync, FastifySchema } from 'fastify'
import { Static, Type } from '@sinclair/typebox'

import { fastifyErrors } from '../../models/utils'

const parametersUploadsSchema = Type.Object({
  image: Type.String()
})

type ParametersUploadsSchemaType = Static<typeof parametersUploadsSchema>

const getUploadsSchema: FastifySchema = {
  tags: ['uploads'] as string[],
  params: parametersUploadsSchema,
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

  fastify.route<{ Params: ParametersUploadsSchemaType }>({
    method: 'GET',
    url: '/uploads/guilds/:image',
    schema: getUploadsSchema,
    handler: async (request, reply) => {
      const { image } = request.params
      return await reply.sendFile(path.join('guilds', image))
    }
  })

  fastify.route<{ Params: ParametersUploadsSchemaType }>({
    method: 'GET',
    url: '/uploads/messages/:image',
    schema: getUploadsSchema,
    handler: async (request, reply) => {
      const { image } = request.params
      return await reply.sendFile(path.join('messages', image))
    }
  })
}
