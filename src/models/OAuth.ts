import { Type } from '@sinclair/typebox'

import { date, id } from './utils.js'

export const providers = ['Google', 'GitHub', 'Discord'] as const
export const strategies = [...providers, 'Local'] as const

export const strategiesTypebox = strategies.map((strategy) =>
  Type.Literal(strategy)
)
export const providersTypebox = providers.map((provider) =>
  Type.Literal(provider)
)

export type ProviderOAuth = typeof providers[number]
export type AuthenticationStrategy = typeof strategies[number]

export const oauthSchema = {
  id,
  providerId: Type.String(),
  provider: Type.Union([...providersTypebox]),
  createdAt: date.createdAt,
  updatedAt: date.updatedAt,
  userId: id
}
