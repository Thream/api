import { userExample } from '../../../models/User.js'
import { userSettingsExample } from '../../../models/UserSettings.js'
import { prismaMock } from '../../../__test__/setup.js'
import { OAuthStrategy } from '../OAuthStrategy.js'

const oauthStrategy = new OAuthStrategy('discord')

describe('/tools/utils/OAuthStrategy - callbackSignin', () => {
  it('should signup the user', async () => {
    const name = 'Martin'
    const id = '12345'
    prismaMock.oAuth.findFirst.mockResolvedValue(null)
    prismaMock.user.count.mockResolvedValue(0)
    prismaMock.user.create.mockResolvedValue({
      ...userExample,
      name
    })
    prismaMock.userSetting.create.mockResolvedValue(userSettingsExample)
    prismaMock.oAuth.create.mockResolvedValue({
      id: 1,
      userId: userExample.id,
      provider: 'discord',
      providerId: id,
      updatedAt: new Date(),
      createdAt: new Date()
    })
    await oauthStrategy.callbackSignin({ id, name })
    expect(prismaMock.oAuth.findFirst).toHaveBeenCalledWith({
      where: {
        provider: 'discord',
        providerId: id
      }
    })
    expect(prismaMock.user.count).toHaveBeenCalledWith({
      where: { name }
    })
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: { name }
    })
    expect(prismaMock.userSetting.create).toHaveBeenCalledWith({
      data: {
        userId: userExample.id
      }
    })
    expect(prismaMock.oAuth.create).toHaveBeenCalledWith({
      data: {
        userId: userExample.id,
        provider: 'discord',
        providerId: id
      }
    })
  })
})

describe('/tools/utils/OAuthStrategy - callbackAddStrategy', () => {
  it('should add the strategy to the user', async () => {
    const name = userExample.name
    const id = '12345'
    prismaMock.oAuth.findFirst.mockResolvedValue(null)
    prismaMock.oAuth.create.mockResolvedValue({
      id: 1,
      userId: userExample.id,
      provider: 'discord',
      providerId: id,
      updatedAt: new Date(),
      createdAt: new Date()
    })
    const result = await oauthStrategy.callbackAddStrategy(
      { id, name },
      { accessToken: '123', current: userExample, currentStrategy: 'local' }
    )
    expect(prismaMock.oAuth.findFirst).toHaveBeenCalledWith({
      where: {
        provider: 'discord',
        providerId: id
      }
    })
    expect(prismaMock.oAuth.create).toHaveBeenCalledWith({
      data: {
        userId: userExample.id,
        provider: 'discord',
        providerId: id
      }
    })
    expect(result).toEqual('success')
  })

  it('should not add the strategy if the account of the provider is already used', async () => {
    const name = userExample.name
    const id = '12345'
    prismaMock.oAuth.findFirst.mockResolvedValue({
      id: 1,
      userId: 2,
      provider: 'discord',
      providerId: id,
      updatedAt: new Date(),
      createdAt: new Date()
    })
    const result = await oauthStrategy.callbackAddStrategy(
      { id, name },
      { accessToken: '123', current: userExample, currentStrategy: 'local' }
    )
    expect(prismaMock.oAuth.findFirst).toHaveBeenCalledWith({
      where: {
        provider: 'discord',
        providerId: id
      }
    })
    expect(prismaMock.oAuth.create).not.toHaveBeenCalled()
    expect(result).toEqual('This account is already used by someone else')
  })

  it('should not add the strategy if the user is already connected with it', async () => {
    const name = userExample.name
    const id = '12345'
    prismaMock.oAuth.findFirst.mockResolvedValue({
      id: 1,
      userId: userExample.id,
      provider: 'discord',
      providerId: id,
      updatedAt: new Date(),
      createdAt: new Date()
    })
    const result = await oauthStrategy.callbackAddStrategy(
      { id, name },
      { accessToken: '123', current: userExample, currentStrategy: 'local' }
    )
    expect(prismaMock.oAuth.findFirst).toHaveBeenCalledWith({
      where: {
        provider: 'discord',
        providerId: id
      }
    })
    expect(prismaMock.oAuth.create).not.toHaveBeenCalled()
    expect(result).toEqual('You are already using this account')
  })
})
