import { URL, pathToFileURL } from 'node:url'
import path from 'node:path'

import dotenv from 'dotenv'

dotenv.config()

export const PORT = parseInt(process.env.PORT ?? '8080', 10)
export const HOST = process.env.HOST ?? '0.0.0.0'
export const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'accessTokenSecret'
export const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? 'refreshTokenSecret'
export const JWT_ACCESS_EXPIRES_IN =
  process.env.JWT_ACCESS_EXPIRES_IN ?? '15 minutes'

const importMetaURL = pathToFileURL(path.join(__dirname, 'app.js'))

export const SRC_URL = new URL('../../', importMetaURL)
export const ROOT_URL = new URL('../', SRC_URL)
export const EMAIL_URL = new URL('./email/', ROOT_URL)
export const EMAIL_TEMPLATE_URL = new URL('./email-template.ejs', EMAIL_URL)
export const EMAIL_LOCALES_URL = new URL('./locales/', EMAIL_URL)
export const UPLOADS_URL = new URL('./uploads/', ROOT_URL)

export const supportedImageMimetype = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif'
]

/** in megabytes */
export const maximumImageSize = 10
export const maximumFileSize = 100
