import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

import User, { UserJWT, UserRequest } from '../models/User'
import { BadRequestError } from '../utils/errors/BadRequestError'
import { ForbiddenError } from '../utils/errors/ForbiddenError'
import { UnauthorizedError } from '../utils/errors/UnauthorizedError'

export const errorsMessages = {
  invalidAccount:
    'You should have a confirmed account, please check your email and follow the instructions to verify your account'
}

export const getUserWithBearerToken = async (
  bearerToken?: string
): Promise<UserRequest> => {
  if (bearerToken == null || typeof bearerToken !== 'string') {
    throw new UnauthorizedError()
  }

  const tokenSplited = bearerToken.split(' ')
  if (tokenSplited.length !== 2 || tokenSplited[0] !== 'Bearer') {
    throw new UnauthorizedError()
  }

  const token = tokenSplited[1]
  let payload: UserJWT
  try {
    payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as UserJWT
  } catch {
    throw new ForbiddenError()
  }

  const user = await User.findOne({ where: { id: payload.id } })
  if (user == null) {
    throw new ForbiddenError()
  }

  if (!user.isConfirmed && payload.currentStrategy === 'local') {
    throw new BadRequestError(errorsMessages.invalidAccount)
  }

  return {
    current: user,
    currentStrategy: payload.currentStrategy,
    accessToken: token
  }
}

export const authenticateUser: RequestHandler = async (req, _res, next) => {
  const authorizationHeader = req.get('Authorization')
  req.user = await getUserWithBearerToken(authorizationHeader)
  return next()
}
