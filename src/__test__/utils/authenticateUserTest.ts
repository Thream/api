import type { User } from "@prisma/client"
import sinon from "sinon"

import { refreshTokenExample } from "#src/models/RefreshToken.js"
import type { UserJWT } from "#src/models/User.js"
import { userExample } from "#src/models/User.js"
import { userSettingsExample } from "#src/models/UserSettings.js"
import {
  generateAccessToken,
  generateRefreshToken,
} from "#src/tools/utils/jwtToken.js"
import prisma from "#src/tools/database/prisma.js"

const userStubValue = {
  findUnique: async () => {
    return userExample
  },
}
const userSettingStubValue = {
  findFirst: async () => {
    return userSettingsExample
  },
}
const oAuthStubValue = {
  findMany: async () => {
    return []
  },
}
const refreshTokenStubValue = {
  create: async () => {
    return refreshTokenExample
  },
}

export const authenticateUserTest = async (): Promise<{
  accessToken: string
  refreshToken: string
  user: User
  userStubValue: typeof userStubValue
  userSettingStubValue: typeof userSettingStubValue
  oAuthStubValue: typeof oAuthStubValue
  refreshTokenStubValue: typeof refreshTokenStubValue
}> => {
  sinon.stub(prisma, "user").value(userStubValue)
  sinon.stub(prisma, "userSetting").value(userSettingStubValue)
  sinon.stub(prisma, "oAuth").value(oAuthStubValue)
  sinon.stub(prisma, "refreshToken").value(refreshTokenStubValue)
  const userJWT: UserJWT = {
    currentStrategy: "Local",
    id: 1,
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
    refreshTokenStubValue,
  }
}
