import fs from 'node:fs'

import axios from 'axios'
import FormData from 'form-data'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { SavedMultipartFile } from '@fastify/multipart'

import {
  FILE_UPLOADS_API_KEY,
  FILE_UPLOADS_API_URL
} from '../configurations.js'

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
  let files: SavedMultipartFile[] = []
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
  const file = files[0]
  if (files.length !== 1 || file == null) {
    throw fastify.httpErrors.badRequest('You must upload at most one file.')
  }
  const formData = new FormData()
  formData.append('file', fs.createReadStream(file.filepath))
  try {
    const response = await fileUploadAPI.post(
      `/uploads/${folderInUploadsFolder}`,
      formData,
      {
        headers: {
          'X-API-Key': FILE_UPLOADS_API_KEY,
          ...formData.getHeaders()
        }
      }
    )
    return { pathToStoreInDatabase: response.data, mimetype: file.mimetype }
  } catch (error: any) {
    throw fastify.httpErrors.createError(
      error.response.data.statusCode,
      error.response.data.message
    )
  }
}
