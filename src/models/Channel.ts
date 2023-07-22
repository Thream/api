import { Type } from '@sinclair/typebox'
import type { Channel } from '@prisma/client'

import { date, id } from '#src/models/utils.js'
import { guildExample } from '#src/models/Guild.js'

export const types = [Type.Literal('text')]

export const channelSchema = {
  id,
  name: Type.String({ minLength: 1, maxLength: 20 }),
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
