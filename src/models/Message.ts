import { Type } from '@sinclair/typebox'

import { date, id } from './utils.js'

export const types = [Type.Literal('text'), Type.Literal('file')]

export const messageSchema = {
  id,
  value: Type.String(),
  type: Type.Union(types, { default: 'text' }),
  mimetype: Type.String({
    maxLength: 255,
    default: 'text/plain',
    format: 'mimetype'
  }),
  createdAt: date.createdAt,
  updatedAt: date.updatedAt,
  memberId: id,
  channelId: id
}
