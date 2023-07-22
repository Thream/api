import { URL } from 'node:url'

import dotenv from 'dotenv'

dotenv.config()

export const PORT = Number.parseInt(process.env['PORT'] ?? '8080', 10)
export const HOST = process.env['HOST'] ?? '0.0.0.0'
export const API_URL = process.env['API_URL'] ?? `http://${HOST}:${PORT}`
export const FILE_UPLOADS_API_URL =
  process.env['FILE_UPLOADS_API_URL'] ?? 'http://localhost:8000'
export const FILE_UPLOADS_API_KEY =
  process.env['FILE_UPLOADS_API_KEY'] ?? 'apiKeySecret'
export const JWT_ACCESS_SECRET =
  process.env['JWT_ACCESS_SECRET'] ?? 'accessTokenSecret'
export const JWT_REFRESH_SECRET =
  process.env['JWT_REFRESH_SECRET'] ?? 'refreshTokenSecret'
export const JWT_ACCESS_EXPIRES_IN =
  process.env['JWT_ACCESS_EXPIRES_IN'] ?? '15 minutes'

export const SRC_URL = new URL('../', import.meta.url)
export const ROOT_URL = new URL('../', SRC_URL)
export const EMAIL_URL = new URL('./email/', ROOT_URL)
export const EMAIL_TEMPLATE_URL = new URL('./email-template.ejs', EMAIL_URL)
export const EMAIL_LOCALES_URL = new URL('./locales/', EMAIL_URL)
