import fs from 'node:fs'
import { URL } from 'node:url'
import { randomUUID } from 'node:crypto'

import { FastifyInstance, FastifyRequest } from 'fastify'

import { Multipart } from 'fastify-multipart'

import { ROOT_URL } from '../configurations/index.js'

export interface UploadFileOptions {
  folderInUploadsFolder: 'guilds' | 'messages' | 'users'
  request: FastifyRequest
  fastify: FastifyInstance

  /** in megabytes */
  maximumFileSize: number

  supportedFileMimetype?: string[]
}

export interface UploadFileResult {
  pathToStoreInDatabase: string
  mimetype: string
}

export const uploadFile = async (
  options: UploadFileOptions
): Promise<UploadFileResult> => {
  const {
    fastify,
    request,
    folderInUploadsFolder,
    maximumFileSize,
    supportedFileMimetype
  } = options
  let files: Multipart[] = []
  try {
    files = await request.saveRequestFiles({
      limits: {
        files: 1,
        fileSize: maximumFileSize * 1024 * 1024
      }
    })
  } catch (error) {
    throw fastify.httpErrors.requestHeaderFieldsTooLarge(
      `File should be less than ${maximumFileSize}mb.`
    )
  }
  if (files.length !== 1) {
    throw fastify.httpErrors.badRequest('You must upload at most one file.')
  }
  const file = files[0]
  if (
    supportedFileMimetype != null &&
    !supportedFileMimetype.includes(file.mimetype)
  ) {
    throw fastify.httpErrors.badRequest(
      `The file must have a valid type (${supportedFileMimetype.join(', ')}).`
    )
  }
  const splitedMimetype = file.mimetype.split('/')
  const fileExtension = splitedMimetype[1]
  const filePath = `uploads/${folderInUploadsFolder}/${randomUUID()}.${fileExtension}`
  const fileURL = new URL(filePath, ROOT_URL)
  const pathToStoreInDatabase = `/${filePath}`
  await fs.promises.copyFile(file.filepath, fileURL)
  return { pathToStoreInDatabase, mimetype: file.mimetype }
}
