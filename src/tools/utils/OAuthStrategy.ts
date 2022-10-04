import type { ResponseJWT } from './jwtToken.js'
import {
  expiresIn,
  generateAccessToken,
  generateRefreshToken
} from './jwtToken.js'
import prisma from '../database/prisma.js'
import type { ProviderOAuth } from '../../models/OAuth.js'
import type { UserRequest } from '../../models/User.js'

interface ProviderData {
  name: string
  id: number | string
}

type ResponseCallbackAddStrategy =
  | 'success'
  | 'This account is already used by someone else'
  | 'You are already using this account'

export class OAuthStrategy {
  constructor(public provider: ProviderOAuth) {}

  async callbackAddStrategy(
    providerData: ProviderData,
    userRequest: UserRequest
  ): Promise<ResponseCallbackAddStrategy> {
    const OAuthUser = await prisma.oAuth.findFirst({
      where: { providerId: providerData.id.toString(), provider: this.provider }
    })
    let message: ResponseCallbackAddStrategy = 'success'
    if (OAuthUser == null) {
      await prisma.oAuth.create({
        data: {
          provider: this.provider,
          providerId: providerData.id.toString(),
          userId: userRequest.current.id
        }
      })
    } else if (OAuthUser.userId !== userRequest.current.id) {
      message = 'This account is already used by someone else'
    } else {
      message = 'You are already using this account'
    }
    return message
  }

  async callbackSignin(providerData: ProviderData): Promise<ResponseJWT> {
    const OAuthUser = await prisma.oAuth.findFirst({
      where: { providerId: providerData.id.toString(), provider: this.provider }
    })
    let userId: number = OAuthUser?.userId ?? 0
    if (OAuthUser == null) {
      let name = providerData.name
      let isAlreadyUsedName = true
      let countId: string | number = providerData.id
      while (isAlreadyUsedName) {
        const foundUsers = await prisma.user.count({ where: { name } })
        isAlreadyUsedName = foundUsers > 0
        if (isAlreadyUsedName) {
          name = `${name}-${countId}`
          countId = Math.random() * Date.now()
        }
      }
      const user = await prisma.user.create({ data: { name } })
      await prisma.userSetting.create({
        data: {
          userId: user.id
        }
      })
      userId = user.id
      await prisma.oAuth.create({
        data: {
          provider: this.provider,
          providerId: providerData.id.toString(),
          userId
        }
      })
    }
    const accessToken = generateAccessToken({
      currentStrategy: this.provider,
      id: userId
    })
    const refreshToken = await generateRefreshToken({
      currentStrategy: this.provider,
      id: userId
    })
    return {
      accessToken,
      refreshToken,
      expiresIn,
      type: 'Bearer'
    }
  }
}
