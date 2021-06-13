import { Type } from '@sinclair/typebox'

import { date, id } from './utils'

export const guildSchema = {
  id,
  name: Type.String({ maxLength: 255 }),
  icon: Type.String({ format: 'uri-reference' }),
  description: Type.String(),
  type: Type.String({ maxLength: 255, default: 'public' }),
  createdAt: date.createdAt,
  updatedAt: date.updatedAt
}
