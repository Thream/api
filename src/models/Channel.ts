import { Type } from '@sinclair/typebox'
import { Channel } from '@prisma/client'

import { date, id } from './utils.js'
import { guildExample } from './Guild.js'

export const types = [Type.Literal('text')]

export const channelSchema = {
  id,
  name: Type.String({ maxLength: 255 }),
  createdAt: date.createdAt,
  updatedAt: date.updatedAt,
  guildId: id
}

export const channelExample: Channel = {
  id: 1,
  name: 'general',
  guildId: guildExample.id,
  createdAt: new Date(),
  updatedAt: new Date()
}
