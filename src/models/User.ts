import { User } from '@prisma/client'
import { Static, Type } from '@sinclair/typebox'

import { AuthenticationStrategy } from './OAuth'
import { userSettingsSchema } from './UserSettings'
import { date, id } from './utils'

export interface UserJWT {
  id: number
  currentStrategy: AuthenticationStrategy
}

export const userSchema = {
  id,
  name: Type.String({ maxLength: 255 }),
  email: Type.String({ maxLength: 255, format: 'email' }),
  password: Type.String(),
  logo: Type.String({ format: 'uri-reference' }),
  status: Type.String({ maxLength: 255 }),
  biography: Type.String(),
  isConfirmed: Type.Boolean({ default: false }),
  temporaryToken: Type.String(),
  temporaryExpirationToken: Type.String({ format: 'date-time' }),
  createdAt: date.createdAt,
  updatedAt: date.updatedAt
}

export const bodyUserSchema = Type.Object({
  email: userSchema.email,
  name: userSchema.name,
  password: userSchema.password,
  theme: userSettingsSchema.theme,
  language: userSettingsSchema.language
})

export type BodyUserSchemaType = Static<typeof bodyUserSchema>

export const userExample: User = {
  id: 1,
  name: 'Divlo',
  email: 'contact@divlo.fr',
  password: 'somepassword',
  logo: null,
  status: null,
  biography: null,
  isConfirmed: false,
  temporaryToken: 'tempUUIDtoken',
  temporaryExpirationToken: null,
  createdAt: new Date(),
  updatedAt: new Date()
}
