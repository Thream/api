import { Guild } from '@prisma/client'
import { Type } from '@sinclair/typebox'

import { date, id } from './utils.js'

export const guildSchema = {
  id,
  name: Type.String({ minLength: 3, maxLength: 30 }),
  icon: Type.String({ format: 'uri-reference' }),
  description: Type.String({ maxLength: 160 }),
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
