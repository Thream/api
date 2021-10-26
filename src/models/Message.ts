import { Type } from '@sinclair/typebox'

import { date, id } from './utils.js'

export const types = [Type.Literal('text'), Type.Literal('file')]

export const messageSchema = {
  id,
  value: Type.String({
    minLength: 1,
    maxLength: 20_000
  }),
  type: Type.Union(types, { default: 'text' }),
  mimetype: Type.String({
    maxLength: 127,
    default: 'text/plain',
    format: 'mimetype'
  }),
  createdAt: date.createdAt,
  updatedAt: date.updatedAt,
  memberId: id,
  channelId: id
}
