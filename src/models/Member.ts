import { Type } from '@sinclair/typebox'
import type { Member } from '@prisma/client'

import { date, id } from '#src/models/utils.js'
import { guildExample } from '#src/models/Guild.js'
import { userExample } from '#src/models/User.js'

export const memberSchema = {
  id,
  isOwner: Type.Boolean({ default: false }),
  createdAt: date.createdAt,
  updatedAt: date.updatedAt,
  userId: id,
  guildId: id
}

export const memberExample: Member = {
  id: 1,
  isOwner: true,
  userId: userExample.id,
  guildId: guildExample.id,
  createdAt: new Date(),
  updatedAt: new Date()
}
