import type { RefreshToken } from "@prisma/client"
import { Type } from "@sinclair/typebox"

import { userExample } from "#src/models/User.js"
import { date, id } from "#src/models/utils.js"

export const refreshTokensSchema = {
  id,
  token: Type.String({ format: "uuid" }),
  createdAt: date.createdAt,
  updatedAt: date.updatedAt,
  userId: id,
}

export const refreshTokenExample: RefreshToken = {
  id: 1,
  userId: userExample.id,
  token: "sometokenUUID",
  createdAt: new Date(),
  updatedAt: new Date(),
}
