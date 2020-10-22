import jwt from 'jsonwebtoken'
import ms from 'ms'

import RefreshToken from '../../models/RefreshToken'
import { UserJWT } from '../../models/User'

const expiresInMinutesString = '15 minutes'

/** expiresIn is how long, in seconds, until the returned accessToken expires */
export const expiresIn = ms(expiresInMinutesString) / 1000

export const generateAccessToken = (user: UserJWT): string => {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, {
    expiresIn: expiresInMinutesString
  })
}

export const generateRefreshToken = async (user: UserJWT): Promise<string> => {
  const refreshToken = jwt.sign(user, process.env.JWT_REFRESH_SECRET)
  await RefreshToken.create({ token: refreshToken, userId: user.id })
  return refreshToken
}
