import OAuth, { ProviderOAuth } from '../../../models/OAuth'
import User, { UserRequest } from '../../../models/User'
import UserSetting from '../../../models/UserSetting'
import {
  expiresIn,
  generateAccessToken,
  generateRefreshToken,
  ResponseJWT
} from '../../../tools/configurations/jwtToken'

interface ProviderData {
  name: string
  id: number | string
}

type ResponseCallbackAddStrategy =
  | 'success'
  | 'This account is already used by someone else'
  | 'You are already using this account'

export class OAuthStrategy {
  constructor (public provider: ProviderOAuth) {}

  async callbackAddStrategy (
    providerData: ProviderData,
    userRequest: UserRequest
  ): Promise<ResponseCallbackAddStrategy> {
    const OAuthUser = await OAuth.findOne({
      where: { providerId: providerData.id, provider: this.provider }
    })
    let message: ResponseCallbackAddStrategy = 'success'

    if (OAuthUser == null) {
      await OAuth.create({
        provider: this.provider,
        providerId: providerData.id,
        userId: userRequest.current.id
      })
    } else if (OAuthUser.userId !== userRequest.current.id) {
      message = 'This account is already used by someone else'
    } else {
      message = 'You are already using this account'
    }

    return message
  }

  async callbackSignin (providerData: ProviderData): Promise<ResponseJWT> {
    const OAuthUser = await OAuth.findOne({
      where: { providerId: providerData.id, provider: this.provider }
    })
    let userId: number = OAuthUser?.userId ?? 0
    if (OAuthUser == null) {
      let name = providerData.name
      let isAlreadyUsedName = true
      let countId: string | number = providerData.id
      while (isAlreadyUsedName) {
        const foundUsers = await User.count({ where: { name } })
        isAlreadyUsedName = foundUsers > 0
        if (isAlreadyUsedName) {
          name = `${name}-${countId}`
          countId = Math.random() * Date.now()
        }
      }
      const user = await User.create({ name })
      await UserSetting.create({ userId: user.id })
      userId = user.id
      await OAuth.create({
        provider: this.provider,
        providerId: providerData.id,
        userId: user.id
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
