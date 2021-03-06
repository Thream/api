import { RefreshToken } from '@prisma/client'
import { Type } from '@sinclair/typebox'

import { userExample } from './User'
import { date, id } from './utils'

export const refreshTokensSchema = {
  id,
  token: Type.String(),
  createdAt: date.createdAt,
  updatedAt: date.updatedAt,
  userId: id
}

export const refreshTokenExample: RefreshToken = {
  id: 1,
  userId: userExample.id,
  token: 'sometoken',
  createdAt: new Date(),
  updatedAt: new Date()
}
