import type { UserSetting } from "@prisma/client"
import type { Static } from "@sinclair/typebox"
import { Type } from "@sinclair/typebox"

import { date, id } from "#src/models/utils.js"

export const languages = [Type.Literal("fr"), Type.Literal("en")]
export const themes = [Type.Literal("light"), Type.Literal("dark")]

export const userSettingsSchema = {
  id,
  language: Type.Union(languages),
  theme: Type.Union(themes),
  isPublicEmail: Type.Boolean(),
  isPublicGuilds: Type.Boolean(),
  createdAt: date.createdAt,
  updatedAt: date.updatedAt,
  userId: id,
}

export type Theme = Static<typeof userSettingsSchema.theme>
export type Language = Static<typeof userSettingsSchema.language>

export const userSettingsExample: UserSetting = {
  id: 1,
  theme: "dark",
  language: "en",
  isPublicEmail: false,
  isPublicGuilds: false,
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}
