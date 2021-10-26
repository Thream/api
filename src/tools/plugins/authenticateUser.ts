import fastifyPlugin from 'fastify-plugin'
import httpErrors from 'http-errors'
import jwt from 'jsonwebtoken'

import prisma from '../database/prisma.js'
import { UserJWT, UserRequest } from '../../models/User.js'
import { JWT_ACCESS_SECRET } from '../configurations/index.js'

const { Unauthorized, Forbidden, BadRequest } = httpErrors

export const getUserWithBearerToken = async (
  bearerToken?: string
): Promise<UserRequest> => {
  if (bearerToken == null || typeof bearerToken !== 'string') {
    throw new Unauthorized()
  }

  const tokenSplitted = bearerToken.split(' ')
  if (tokenSplitted.length !== 2 || tokenSplitted[0] !== 'Bearer') {
    throw new Unauthorized()
  }

  const token = tokenSplitted[1]
  let payload: UserJWT
  try {
    payload = jwt.verify(token, JWT_ACCESS_SECRET) as UserJWT
  } catch {
    throw new Forbidden()
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } })
  if (user == null) {
    throw new Forbidden()
  }

  if (!user.isConfirmed && payload.currentStrategy === 'local') {
    throw new BadRequest(
      'You should have a confirmed account, please check your email and follow the instructions to verify your account'
    )
  }

  return {
    current: user,
    currentStrategy: payload.currentStrategy,
    accessToken: token
  }
}

declare module 'fastify' {
  export interface FastifyRequest {
    user?: UserRequest
  }
}

export default fastifyPlugin(
  async (fastify) => {
    fastify.decorateRequest('user', null)
    fastify.addHook('onRequest', async (request) => {
      const { authorization } = request.headers
      request.user = await getUserWithBearerToken(authorization)
    })
  },
  { fastify: '3.x' }
)