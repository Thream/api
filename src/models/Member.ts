import { Type } from '@sinclair/typebox'

import { date, id } from './utils'

export const memberSchema = {
  id,
  isOwner: Type.Boolean({ default: false }),
  createdAt: date.createdAt,
  updatedAt: date.updatedAt,
  userId: id,
  guildId: id
}
