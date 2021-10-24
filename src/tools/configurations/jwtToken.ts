import jwt from 'jsonwebtoken'
import ms from 'ms'

import RefreshToken from '../../models/RefreshToken'
import { UserJWT } from '../../models/User'

export interface ResponseJWT {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  type: 'Bearer'
}

export const expiresInString = process.env.JWT_ACCESS_EXPIRES_IN

/** expiresIn is how long, in milliseconds, until the returned accessToken expires */
export const expiresIn = ms(expiresInString)

export const generateAccessToken = (user: UserJWT): string => {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, {
    expiresIn: expiresInString
  })
}

export const generateRefreshToken = async (user: UserJWT): Promise<string> => {
  const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET)
  await RefreshToken.create({ token: refreshToken, userId: user.id })
  return refreshToken
}
