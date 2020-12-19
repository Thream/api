import { OAuthStrategy } from '../OAuthStrategy'
import OAuth from '../../../../models/OAuth'
import User from '../../../../models/User'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import RefreshToken from '../../../../models/RefreshToken'

const oauthStrategy = new OAuthStrategy('discord')

describe('/users/utils/OAuthStrategy - callbackSignin', () => {
  it('should signup the user', async () => {
    let users = await User.findAll()
    let oauths = await OAuth.findAll()
    expect(users.length).toEqual(0)
    expect(oauths.length).toEqual(0)
    const name = 'Martin'
    const id = '12345'
    await oauthStrategy.callbackSignin({ id, name })
    users = await User.findAll()
    oauths = await OAuth.findAll()
    expect(users.length).toEqual(1)
    expect(oauths.length).toEqual(1)
    expect(users[0].name).toEqual(name)
    expect(oauths[0].providerId).toEqual(id)
    expect(oauths[0].provider).toEqual(oauthStrategy.provider)
  })

  it('should signup the user and generate a new name when already used', async () => {
    const oauths = await OAuth.findAll()
    expect(oauths.length).toEqual(0)
    const name = 'Martin'
    const id = '1234'
    await authenticateUserTest({
      name,
      shouldBeConfirmed: true,
      email: 'martin@example.com',
      password: 'password'
    })
    await oauthStrategy.callbackSignin({ id, name })
    const oauth = await OAuth.findOne({ where: { providerId: id } })
    expect(oauth?.provider).toEqual(oauthStrategy.provider)
    expect(oauth?.providerId).toEqual(id)
    expect(oauth?.userId).toEqual(2)
    const user = await User.findByPk(oauth?.userId)
    expect(user?.name.startsWith(name)).toBeTruthy()
    expect(user?.name).not.toEqual(name)
  })

  it('should signin the user if already connected with the provider', async () => {
    const name = 'Martin'
    const id = '1234'
    await oauthStrategy.callbackSignin({ id, name })
    let oauths = await OAuth.findAll()
    expect(oauths.length).toEqual(1)
    await oauthStrategy.callbackSignin({ id, name })
    oauths = await OAuth.findAll()
    expect(oauths.length).toEqual(1)
  })
})

describe('/users/utils/OAuthStrategy - callbackAddStrategy', () => {
  it('should add the strategy', async () => {
    const userTokens = await authenticateUserTest()
    const user = await User.findOne({ where: { id: userTokens.userId } })
    expect(user).not.toBeNull()
    if (user != null) {
      const result = await oauthStrategy.callbackAddStrategy(
        { name: user.name, id: '1234' },
        {
          current: user,
          accessToken: userTokens.accessToken,
          currentStrategy: 'local'
        }
      )
      expect(result).toEqual('success')
    }
  })

  it('should not add the strategy if the account of the provider is already used', async () => {
    const userTokens = await authenticateUserTest()
    const user = await User.findOne({ where: { id: userTokens.userId } })
    const name = 'Martin'
    const id = '1234'
    await oauthStrategy.callbackSignin({ id, name })
    expect(user).not.toBeNull()
    if (user != null) {
      const result = await oauthStrategy.callbackAddStrategy(
        { name: user.name, id: '1234' },
        {
          current: user,
          accessToken: userTokens.accessToken,
          currentStrategy: 'local'
        }
      )
      expect(result).toEqual('This account is already used by someone else')
    }
  })

  it('should not add the strategy if the user is already connected with it', async () => {
    const name = 'Martin'
    const id = '1234'
    const userTokens = await oauthStrategy.callbackSignin({ id, name })
    const refreshToken = await RefreshToken.findOne({
      where: { token: userTokens.refreshToken as string },
      include: [{ model: User }]
    })
    expect(refreshToken).not.toBeNull()
    if (refreshToken != null) {
      const result = await oauthStrategy.callbackAddStrategy(
        { name: refreshToken.user.name, id: '1234' },
        {
          current: refreshToken.user,
          accessToken: userTokens.accessToken,
          currentStrategy: oauthStrategy.provider
        }
      )
      expect(result).toEqual('You are already using this account')
    }
  })
})
