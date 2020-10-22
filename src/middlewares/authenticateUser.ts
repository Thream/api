import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

import User, { UserJWT } from '../models/User'
import { BadRequestError } from '../utils/errors/BadRequestError'
import { ForbiddenError } from '../utils/errors/ForbiddenError'
import { UnauthorizedError } from '../utils/errors/UnauthorizedError'

export const errorsMessages = {
  invalidAccount:
    'You should have a confirmed account, please check your email and follow the instructions to verify your account'
}

export const authenticateUser: RequestHandler = async (req, _res, next) => {
  const authorizationHeader = req.get('Authorization')
  if (authorizationHeader == null || typeof authorizationHeader !== 'string') {
    throw new UnauthorizedError()
  }

  const tokenSplited = authorizationHeader.split(' ')
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

  if (!user.isConfirmed && payload.strategy === 'local') {
    throw new BadRequestError(errorsMessages.invalidAccount)
  }

  req.user = {
    current: user,
    strategy: payload.strategy
  }
  return next()
}
