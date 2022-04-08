import fs from 'node:fs'

import axios from 'axios'
import FormData from 'form-data'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { Multipart } from 'fastify-multipart'

import { FILE_UPLOADS_API_URL } from '../configurations/index.js'

export const fileUploadAPI = axios.create({
  baseURL: FILE_UPLOADS_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

/** in megabytes */
export const MAXIMUM_FILE_SIZE = 100

export interface UploadFileOptions {
  folderInUploadsFolder: 'guilds' | 'messages' | 'users'
  request: FastifyRequest
  fastify: FastifyInstance
}

export interface UploadFileResult {
  pathToStoreInDatabase: string
  mimetype: string
}

export const uploadFile = async (
  options: UploadFileOptions
): Promise<UploadFileResult> => {
  const { fastify, request, folderInUploadsFolder } = options
  let files: Multipart[] = []
  try {
    files = await request.saveRequestFiles({
      limits: {
        files: 1,
        fileSize: MAXIMUM_FILE_SIZE * 1024 * 1024
      }
    })
  } catch (error) {
    throw fastify.httpErrors.requestHeaderFieldsTooLarge(
      `File should be less than ${MAXIMUM_FILE_SIZE}mb.`
    )
  }
  if (files.length !== 1) {
    throw fastify.httpErrors.badRequest('You must upload at most one file.')
  }
  const file = files[0]
  const formData = new FormData()
  formData.append('file', fs.createReadStream(file.filepath))
  try {
    const response = await fileUploadAPI.post(
      `/uploads/${folderInUploadsFolder}`,
      formData,
      { headers: formData.getHeaders() }
    )
    return { pathToStoreInDatabase: response.data, mimetype: file.mimetype }
  } catch (error: any) {
    throw fastify.httpErrors.createError(
      error.response.data.error,
      error.response.data.message
    )
  }
}
