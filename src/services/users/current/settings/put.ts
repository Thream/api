import type { Static } from "@sinclair/typebox"
import { Type } from "@sinclair/typebox"
import type { FastifyPluginAsync, FastifySchema } from "fastify"

import prisma from "#src/tools/database/prisma.js"
import { fastifyErrors } from "#src/models/utils.js"
import authenticateUser from "#src/tools/plugins/authenticateUser.js"
import { userSettingsSchema } from "#src/models/UserSettings.js"

const bodyPutServiceSchema = Type.Object({
  theme: Type.Optional(userSettingsSchema.theme),
  language: Type.Optional(userSettingsSchema.language),
  isPublicEmail: Type.Optional(userSettingsSchema.isPublicEmail),
  isPublicGuilds: Type.Optional(userSettingsSchema.isPublicGuilds),
})

type BodyPutServiceSchemaType = Static<typeof bodyPutServiceSchema>

const putServiceSchema: FastifySchema = {
  description: "Edit the current connected user settings",
  tags: ["users"] as string[],
  security: [
    {
      bearerAuth: [],
    },
  ] as Array<{ [key: string]: [] }>,
  body: bodyPutServiceSchema,
  response: {
    200: Type.Object({
      settings: Type.Object(userSettingsSchema),
    }),
    400: fastifyErrors[400],
    401: fastifyErrors[401],
    403: fastifyErrors[403],
    500: fastifyErrors[500],
  },
} as const

export const putCurrentUserSettings: FastifyPluginAsync = async (fastify) => {
  await fastify.register(authenticateUser)

  fastify.route<{
    Body: BodyPutServiceSchemaType
  }>({
    method: "PUT",
    url: "/users/current/settings",
    schema: putServiceSchema,
    handler: async (request, reply) => {
      if (request.user == null) {
        throw fastify.httpErrors.forbidden()
      }
      const { theme, language, isPublicEmail, isPublicGuilds } = request.body
      const settings = await prisma.userSetting.findFirst({
        where: { userId: request.user.current.id },
      })
      if (settings == null) {
        throw fastify.httpErrors.internalServerError()
      }
      const newSettings = await prisma.userSetting.update({
        where: { id: request.user.current.id },
        data: {
          theme: theme ?? settings.theme,
          language: language ?? settings.language,
          isPublicEmail: isPublicEmail ?? settings.isPublicEmail,
          isPublicGuilds: isPublicGuilds ?? settings.isPublicGuilds,
        },
      })
      reply.statusCode = 200
      return { settings: newSettings }
    },
  })
}
