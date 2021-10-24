import { User } from '@prisma/client'
import { Static, Type } from '@sinclair/typebox'

import { AuthenticationStrategy, strategiesTypebox } from './OAuth.js'
import { userSettingsSchema } from './UserSettings.js'
import { date, id } from './utils.js'

export interface UserJWT {
  id: number
  currentStrategy: AuthenticationStrategy
}

export interface UserRequest {
  current: User
  currentStrategy: AuthenticationStrategy
  accessToken: string
}

export const userSchema = {
  id,
  name: Type.String({ minLength: 1, maxLength: 30 }),
  email: Type.String({ minLength: 1, maxLength: 255, format: 'email' }),
  password: Type.String(),
  logo: Type.String({ format: 'uri-reference' }),
  status: Type.String({ maxLength: 255 }),
  biography: Type.String(),
  website: Type.String({ maxLength: 255, format: 'uri-reference' }),
  isConfirmed: Type.Boolean({ default: false }),
  temporaryToken: Type.String(),
  temporaryExpirationToken: Type.String({ format: 'date-time' }),
  createdAt: date.createdAt,
  updatedAt: date.updatedAt
}

export const userPublicSchema = {
  id,
  name: userSchema.name,
  email: Type.Optional(userSchema.email),
  logo: Type.Optional(userSchema.logo),
  status: Type.Optional(userSchema.status),
  biography: Type.Optional(userSchema.biography),
  website: Type.Optional(userSchema.website),
  isConfirmed: userSchema.isConfirmed,
  createdAt: date.createdAt,
  updatedAt: date.updatedAt,
  settings: Type.Optional(Type.Object(userSettingsSchema))
}

export const userCurrentSchema = Type.Object({
  user: Type.Object({
    ...userPublicSchema,
    currentStrategy: Type.Union([...strategiesTypebox]),
    strategies: Type.Array(Type.Union([...strategiesTypebox]))
  })
})

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
  website: null,
  isConfirmed: true,
  temporaryToken: 'temporaryUUIDtoken',
  temporaryExpirationToken: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
}
