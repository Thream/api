import { Type } from '@sinclair/typebox'

import { date, id } from './utils'

export const providers = [
  Type.Literal('google'),
  Type.Literal('github'),
  Type.Literal('discord')
] as const
export const strategies = [...providers, 'local'] as const

export type ProviderOAuth = typeof providers[number]
export type AuthenticationStrategy = typeof strategies[number]

export const oauthSchema = {
  id,
  providerId: Type.String(),
  provider: Type.Union([...providers]),
  createdAt: date.createdAt,
  updatedAt: date.updatedAt,
  userId: id
}
