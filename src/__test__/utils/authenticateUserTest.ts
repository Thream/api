import { User } from '@prisma/client'

import { refreshTokenExample } from '../../models/RefreshToken.js'
import { userExample, UserJWT } from '../../models/User.js'
import { userSettingsExample } from '../../models/UserSettings.js'
import {
  generateAccessToken,
  generateRefreshToken
} from '../../tools/utils/jwtToken'
import { prismaMock } from '../setup'

export const authenticateUserTest = async (): Promise<{
  accessToken: string
  refreshToken: string
  user: User
}> => {
  prismaMock.user.findUnique.mockResolvedValue(userExample)
  prismaMock.userSetting.findFirst.mockResolvedValue(userSettingsExample)
  prismaMock.oAuth.findMany.mockResolvedValue([])
  prismaMock.refreshToken.create.mockResolvedValue(refreshTokenExample)
  const userJWT: UserJWT = {
    currentStrategy: 'local',
    id: 1
  }
  const accessToken = generateAccessToken(userJWT)
  const refreshToken = await generateRefreshToken(userJWT)
  return { accessToken, refreshToken, user: userExample }
}
