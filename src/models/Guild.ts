import type { Guild } from '@prisma/client'
import { Type } from '@sinclair/typebox'

import { date, id } from './utils.js'

export const guildSchema = {
  id,
  name: Type.String({ minLength: 1, maxLength: 30 }),
  icon: Type.Union([
    Type.String({ format: 'uri-reference', minLength: 1 }),
    Type.Null()
  ]),
  description: Type.Union([
    Type.String({ minLength: 1, maxLength: 160 }),
    Type.Null()
  ]),
  createdAt: date.createdAt,
  updatedAt: date.updatedAt
}

export const guildExample: Guild = {
  id: 1,
  name: 'GuildExample',
  description: 'guild example.',
  icon: null,
  createdAt: new Date(),
  updatedAt: new Date()
}
