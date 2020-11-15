import axios from 'axios'
import { Request, Response, Router } from 'express'
import { query } from 'express-validator'
import querystring from 'querystring'

import {
  authenticateUser,
  getUserWithBearerToken
} from '../../../middlewares/authenticateUser'
import { validateRequest } from '../../../middlewares/validateRequest'
import OAuth from '../../../models/OAuth'
import User from '../../../models/User'
import {
  expiresIn,
  generateAccessToken,
  generateRefreshToken
} from '../../../utils/config/jwtToken'
import { ForbiddenError } from '../../../utils/errors/ForbiddenError'
import { buildQueryURL } from '../utils/buildQueryURL'
import { isValidRedirectURIValidation } from '../utils/isValidRedirectURIValidation'

interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar?: string
  locale?: string
}

interface DiscordTokens {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: 'identify'
}

const DISCORD_PROVIDER = 'discord'
const DISCORD_BASE_URL = 'https://discordapp.com/api/v6'

const getDiscordUserData = async (
  code: string,
  redirectURI: string
): Promise<DiscordUser> => {
  const { data: tokens } = await axios.post<DiscordTokens>(
    `${DISCORD_BASE_URL}/oauth2/token`,
    querystring.stringify({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectURI,
      scope: 'identify'
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )
  const { data: discordUser } = await axios.get<DiscordUser>(
    `${DISCORD_BASE_URL}/users/@me`,
    {
      headers: {
        Authorization: `${tokens.token_type} ${tokens.access_token}`
      }
    }
  )
  return discordUser
}

const discordRouter = Router()

discordRouter.get(
  '/add-strategy',
  authenticateUser,
  [
    query('redirectURI')
      .notEmpty()
      .trim()
      .custom(isValidRedirectURIValidation)
  ],
  validateRequest,
  (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const { redirectURI } = req.query as { redirectURI: string }
    const redirectCallback = `${process.env.API_BASE_URL}/users/oauth2/discord/callback-add-strategy?redirectURI=${redirectURI}`
    const url = `${DISCORD_BASE_URL}/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&scope=identify&response_type=code&state=${req.user.accessToken}&redirect_uri=${redirectCallback}`
    return res.json(url)
  }
)

discordRouter.get(
  '/callback-add-strategy',
  [
    query('code').notEmpty(),
    query('redirectURI')
      .notEmpty()
      .trim()
      .custom(isValidRedirectURIValidation),
    query('state')
      .notEmpty()
      .trim()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { code, redirectURI, state: accessToken } = req.query as {
      code: string
      redirectURI: string
      state: string
    }
    const userRequest = await getUserWithBearerToken(`Bearer ${accessToken}`)
    const discordUser = await getDiscordUserData(
      code,
      `${process.env.API_BASE_URL}/users/oauth2/discord/callback-add-strategy?redirectURI=${redirectURI}`
    )
    const OAuthUser = await OAuth.findOne({
      where: { providerId: discordUser.id, provider: DISCORD_PROVIDER }
    })
    let message = 'success'

    if (OAuthUser == null) {
      await OAuth.create({
        provider: DISCORD_PROVIDER,
        providerId: discordUser.id,
        userId: userRequest.current.id
      })
    } else if (OAuthUser.userId !== userRequest.current.id) {
      message = 'This account is already used by someone else'
    } else {
      message = 'You are already using this account'
    }

    return res.redirect(buildQueryURL(redirectURI, { message }))
  }
)

discordRouter.get(
  '/signin',
  [
    query('redirectURI')
      .notEmpty()
      .trim()
      .custom(isValidRedirectURIValidation)
  ],
  validateRequest,
  (req: Request, res: Response) => {
    const { redirectURI } = req.query as { redirectURI: string }
    const redirectCallback = `${process.env.API_BASE_URL}/users/oauth2/discord/callback?redirectURI=${redirectURI}`
    const url = `${DISCORD_BASE_URL}/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirectCallback}`
    return res.json(url)
  }
)

discordRouter.get(
  '/callback',
  [
    query('code').notEmpty(),
    query('redirectURI')
      .notEmpty()
      .trim()
      .custom(isValidRedirectURIValidation)
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { code, redirectURI } = req.query as {
      code: string
      redirectURI: string
    }
    const discordUser = await getDiscordUserData(
      code,
      `${process.env.API_BASE_URL}/users/oauth2/discord/callback?redirectURI=${redirectURI}`
    )
    const OAuthUser = await OAuth.findOne({
      where: { providerId: discordUser.id, provider: DISCORD_PROVIDER }
    })
    let userId: number = OAuthUser?.user?.id

    if (OAuthUser == null) {
      let name = discordUser.username
      let isAlreadyUsedName = true
      let countId: string | number = discordUser.discriminator
      while (isAlreadyUsedName) {
        const foundUsers = await User.count({ where: { name } })
        isAlreadyUsedName = foundUsers > 0
        if (isAlreadyUsedName) {
          name = `${name}-${countId}`
          countId = Math.random() * Date.now()
        }
      }
      const user = await User.create({ name })
      userId = user.id
      await OAuth.create({
        provider: DISCORD_PROVIDER,
        providerId: discordUser.id,
        userId: user.id
      })
    }

    const accessToken = generateAccessToken({
      id: userId,
      strategy: DISCORD_PROVIDER
    })
    const refreshToken = await generateRefreshToken({
      strategy: DISCORD_PROVIDER,
      id: userId
    })

    return res.redirect(
      buildQueryURL(redirectURI, {
        accessToken,
        refreshToken,
        expiresIn: expiresIn.toString(),
        type: 'Bearer'
      })
    )
  }
)

export { discordRouter }
