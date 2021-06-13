import { Type } from '@sinclair/typebox'
import jwt from 'jsonwebtoken'
import ms from 'ms'

import prisma from '../database/prisma'
import { UserJWT } from '../../models/User'

export interface ResponseJWT {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  type: 'Bearer'
}

export const jwtSchema = {
  accessToken: Type.String(),
  refreshToken: Type.String(),
  expiresIn: Type.Integer({
    description:
      'expiresIn is how long, in milliseconds, until the returned accessToken expires'
  }),
  type: Type.Literal('Bearer')
}

export const expiresInString = process.env.JWT_ACCESS_EXPIRES_IN
export const expiresIn = ms(expiresInString)

export const generateAccessToken = (user: UserJWT): string => {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, {
    expiresIn: expiresInString
  })
}

export const generateRefreshToken = async (user: UserJWT): Promise<string> => {
  const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET)
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id }
  })
  return refreshToken
}
