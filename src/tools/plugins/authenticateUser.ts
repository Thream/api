import fastifyPlugin from "fastify-plugin"
import httpErrors from "http-errors"
import jwt from "jsonwebtoken"

import prisma from "#src/tools/database/prisma.js"
import type { UserJWT, UserRequest } from "#src/models/User.js"
import { JWT_ACCESS_SECRET } from "#src/tools/configurations.js"

const { Unauthorized, Forbidden, BadRequest } = httpErrors

export const getUserWithBearerToken = async (
  bearerToken?: string,
): Promise<UserRequest> => {
  if (bearerToken == null || typeof bearerToken !== "string") {
    throw new Unauthorized()
  }

  const tokenSplitted = bearerToken.split(" ")
  if (tokenSplitted.length !== 2 || tokenSplitted[0] !== "Bearer") {
    throw new Unauthorized()
  }

  const token = tokenSplitted[1] ?? "token"
  let payload: UserJWT
  try {
    payload = jwt.verify(token, JWT_ACCESS_SECRET) as unknown as UserJWT
  } catch {
    throw new Forbidden()
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } })
  if (user == null) {
    throw new Forbidden()
  }

  if (!user.isConfirmed && payload.currentStrategy === "Local") {
    throw new BadRequest(
      "You should have a confirmed account, please check your email and follow the instructions to verify your account",
    )
  }

  return {
    current: user,
    currentStrategy: payload.currentStrategy,
    accessToken: token,
  }
}

declare module "fastify" {
  export interface FastifyRequest {
    user?: UserRequest
  }
}

export default fastifyPlugin(
  async (fastify) => {
    fastify.decorateRequest("user", undefined)
    fastify.addHook("onRequest", async (request) => {
      const { authorization } = request.headers
      const user = await getUserWithBearerToken(authorization)
      request.user = user
    })
  },
  { fastify: "4.x" },
)
