import { randomUUID } from 'node:crypto'

import { Type } from '@sinclair/typebox'
import jwt from 'jsonwebtoken'
import ms from 'ms'

import prisma from '../database/prisma.js'
import { UserJWT } from '../../models/User.js'
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET
} from '../configurations/index.js'

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
      'expiresIn is how long, in milliseconds, until the accessToken expires'
  }),
  type: Type.Literal('Bearer')
}

export const expiresIn = ms(JWT_ACCESS_EXPIRES_IN)

export const generateAccessToken = (user: UserJWT): string => {
  return jwt.sign(user, JWT_ACCESS_SECRET, { expiresIn })
}

export const generateRefreshToken = async (user: UserJWT): Promise<string> => {
  const tokenUUID = randomUUID()
  const refreshToken = jwt.sign(
    {
      ...user,
      tokenUUID
    },
    JWT_REFRESH_SECRET
  )
  await prisma.refreshToken.create({
    data: { token: tokenUUID, userId: user.id }
  })
  return refreshToken
}
