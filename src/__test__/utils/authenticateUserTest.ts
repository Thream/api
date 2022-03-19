import { User } from '@prisma/client'
import sinon from 'sinon'

import { refreshTokenExample } from '../../models/RefreshToken.js'
import { userExample, UserJWT } from '../../models/User.js'
import { userSettingsExample } from '../../models/UserSettings.js'
import {
  generateAccessToken,
  generateRefreshToken
} from '../../tools/utils/jwtToken.js'
import prisma from '../../tools/database/prisma.js'

export const authenticateUserTest = async (): Promise<{
  accessToken: string
  refreshToken: string
  user: User
  userStubValue: any
  userSettingStubValue: any
  oAuthStubValue: any
  refreshTokenStubValue: any
}> => {
  const userStubValue = {
    findUnique: async () => {
      return userExample
    }
  }
  const userSettingStubValue = {
    findFirst: async () => {
      return userSettingsExample
    }
  }
  const oAuthStubValue = {
    findMany: async () => {
      return []
    }
  }
  const refreshTokenStubValue = {
    create: async () => {
      return refreshTokenExample
    }
  }
  sinon.stub(prisma, 'user').value(userStubValue)
  sinon.stub(prisma, 'userSetting').value(userSettingStubValue)
  sinon.stub(prisma, 'oAuth').value(oAuthStubValue)
  sinon.stub(prisma, 'refreshToken').value(refreshTokenStubValue)
  const userJWT: UserJWT = {
    currentStrategy: 'local',
    id: 1
  }
  const accessToken = generateAccessToken(userJWT)
  const refreshToken = await generateRefreshToken(userJWT)
  return {
    accessToken,
    refreshToken,
    user: userExample,
    userStubValue,
    userSettingStubValue,
    oAuthStubValue,
    refreshTokenStubValue
  }
}
