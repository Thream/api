import type { Static } from "@sinclair/typebox"
import { Type } from "@sinclair/typebox"
import type { FastifyPluginAsync, FastifySchema } from "fastify"
import bcrypt from "bcryptjs"

import prisma from "#src/tools/database/prisma.js"
import { fastifyErrors } from "#src/models/utils.js"
import { userSchema } from "#src/models/User.js"
import {
  generateAccessToken,
  generateRefreshToken,
  jwtSchema,
  expiresIn,
} from "#src/tools/utils/jwtToken.js"

const bodyPostSigninSchema = Type.Object({
  email: userSchema.email,
  password: userSchema.password,
})

type BodyPostSigninSchemaType = Static<typeof bodyPostSigninSchema>

const postSigninSchema: FastifySchema = {
  description: "Signin the user",
  tags: ["users"] as string[],
  body: bodyPostSigninSchema,
  response: {
    200: Type.Object(jwtSchema),
    400: fastifyErrors[400],
    500: fastifyErrors[500],
  },
} as const

export const postSigninUser: FastifyPluginAsync = async (fastify) => {
  await fastify.route<{
    Body: BodyPostSigninSchemaType
  }>({
    method: "POST",
    url: "/users/signin",
    schema: postSigninSchema,
    handler: async (request, reply) => {
      const { email, password } = request.body
      const user = await prisma.user.findUnique({
        where: { email },
      })
      if (user == null) {
        throw fastify.httpErrors.badRequest("Invalid credentials.")
      }
      if (user.password == null) {
        throw fastify.httpErrors.badRequest("Invalid credentials.")
      }
      const isCorrectPassword = await bcrypt.compare(password, user.password)
      if (!isCorrectPassword) {
        throw fastify.httpErrors.badRequest("Invalid credentials.")
      }
      const accessToken = generateAccessToken({
        currentStrategy: "Local",
        id: user.id,
      })
      const refreshToken = await generateRefreshToken({
        currentStrategy: "Local",
        id: user.id,
      })
      reply.statusCode = 200
      return {
        accessToken,
        refreshToken,
        expiresIn,
        type: "Bearer",
      }
    },
  })
}
