import { Type } from '@sinclair/typebox'
import { Member } from '@prisma/client'

import { date, id } from './utils.js'
import { guildExample } from './Guild.js'
import { userExample } from './User.js'

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
