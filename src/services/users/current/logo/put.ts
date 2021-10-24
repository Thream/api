import fs from 'node:fs'
import { URL } from 'node:url'
import { randomUUID } from 'node:crypto'

import { Type } from '@sinclair/typebox'
import { FastifyPluginAsync, FastifySchema } from 'fastify'

import authenticateUser from '../../../../tools/plugins/authenticateUser.js'
import { fastifyErrors } from '../../../../models/utils.js'
import fastifyMultipart, { Multipart } from 'fastify-multipart'
import {
  maximumImageSize,
  supportedImageMimetype,
  ROOT_URL
} from '../../../../tools/configurations'
import prisma from '../../../../tools/database/prisma.js'

const putServiceSchema: FastifySchema = {
  description: 'Edit the current connected user logo',
  tags: ['users'] as string[],
  consumes: ['multipart/form-data'] as string[],
  produces: ['application/json'] as string[],
  security: [
    {
      bearerAuth: []
    }
  ] as Array<{ [key: string]: [] }>,
  response: {
    200: Type.Object({
      user: Type.Object({
        logo: Type.String()
      })
    }),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    431: fastifyErrors[431],
    500: fastifyErrors[500]
  }
} as const

export const putCurrentUserLogo: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  await fastify.register(fastifyMultipart)

  fastify.route({
    method: 'PUT',
    url: '/users/current/logo',
    schema: putServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      let files: Multipart[] = []
      try {
        files = await request.saveRequestFiles({
          limits: {
            files: 1,
            fileSize: maximumImageSize * 1024 * 1024
          }
        })
      } catch (error) {
        throw fastify.httpErrors.requestHeaderFieldsTooLarge(
          `body.logo should be less than ${maximumImageSize}mb.`
        )
      }
      if (files.length !== 1) {
        throw fastify.httpErrors.badRequest('You must upload at most one file.')
      }
      const image = files[0]
      if (!supportedImageMimetype.includes(image.mimetype)) {
        throw fastify.httpErrors.badRequest(
          `The file must have a valid type (${supportedImageMimetype.join(
            ', '
          )}).`
        )
      }
      const splitedMimetype = image.mimetype.split('/')
      const imageExtension = splitedMimetype[1]
      const logoPath = `uploads/users/${randomUUID()}.${imageExtension}`
      const logoURL = new URL(logoPath, ROOT_URL)
      const logo = `/${logoPath}`
      await fs.promises.copyFile(image.filepath, logoURL)
      await prisma.user.update({
        where: { id: request.user.current.id },
        data: { logo }
      })
      reply.statusCode = 200
      return {
        user: {
          logo
        }
      }
    }
  })
}
