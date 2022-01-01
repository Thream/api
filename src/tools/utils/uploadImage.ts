import fs from 'node:fs'
import { URL } from 'node:url'
import { randomUUID } from 'node:crypto'

import { FastifyInstance, FastifyRequest } from 'fastify'

import { Multipart } from 'fastify-multipart'

import {
  maximumImageSize,
  supportedImageMimetype,
  ROOT_URL
} from '../configurations/index.js'

export interface UploadImageOptions {
  folderInUploadsFolder: 'guilds' | 'messages' | 'users'
  request: FastifyRequest
  fastify: FastifyInstance
}

export const uploadImage = async (
  options: UploadImageOptions
): Promise<string> => {
  const { fastify, request, folderInUploadsFolder } = options
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
      `Image should be less than ${maximumImageSize}mb.`
    )
  }
  if (files.length !== 1) {
    throw fastify.httpErrors.badRequest('You must upload at most one file.')
  }
  const image = files[0]
  if (!supportedImageMimetype.includes(image.mimetype)) {
    throw fastify.httpErrors.badRequest(
      `The file must have a valid type (${supportedImageMimetype.join(', ')}).`
    )
  }
  const splitedMimetype = image.mimetype.split('/')
  const imageExtension = splitedMimetype[1]
  const imagePath = `uploads/${folderInUploadsFolder}/${randomUUID()}.${imageExtension}`
  const imageURL = new URL(imagePath, ROOT_URL)
  const imagePathToStoreInDatabase = `/${imagePath}`
  await fs.promises.copyFile(image.filepath, imageURL)
  return imagePathToStoreInDatabase
}
