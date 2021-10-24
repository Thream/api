import axios from 'axios'
import { Request, Response, Router } from 'express'
import { query } from 'express-validator'
import querystring from 'querystring'

import {
  authenticateUser,
  getUserWithBearerToken
} from '../../../tools/middlewares/authenticateUser'
import { validateRequest } from '../../../tools/middlewares/validateRequest'
import { ForbiddenError } from '../../../tools/errors/ForbiddenError'
import { buildQueryURL } from '../__utils__/buildQueryURL'
import { isValidRedirectURIValidation } from '../../../tools/validations/isValidRedirectURIValidation'
import { OAuthStrategy } from '../__utils__/OAuthStrategy'

export const DISCORD_PROVIDER = 'discord'
export const DISCORD_BASE_URL = 'https://discordapp.com/api/v6'
export const discordStrategy = new OAuthStrategy(DISCORD_PROVIDER)

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
  scope: string
}

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

export const discordRouter = Router()

discordRouter.get(
  `/users/oauth2/${DISCORD_PROVIDER}/add-strategy`,
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
    const redirectCallback = `${process.env.API_BASE_URL}/users/oauth2/${DISCORD_PROVIDER}/callback-add-strategy?redirectURI=${redirectURI}`
    const url = `${DISCORD_BASE_URL}/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&scope=identify&response_type=code&state=${req.user.accessToken}&redirect_uri=${redirectCallback}`
    return res.json(url)
  }
)

discordRouter.get(
  `/users/oauth2/${DISCORD_PROVIDER}/callback-add-strategy`,
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
      `${process.env.API_BASE_URL}/users/oauth2/${DISCORD_PROVIDER}/callback-add-strategy?redirectURI=${redirectURI}`
    )
    const message = await discordStrategy.callbackAddStrategy(
      { name: discordUser.username, id: discordUser.id },
      userRequest
    )
    return res.redirect(buildQueryURL(redirectURI, { message }))
  }
)

discordRouter.get(
  `/users/oauth2/${DISCORD_PROVIDER}/signin`,
  [
    query('redirectURI')
      .notEmpty()
      .trim()
      .custom(isValidRedirectURIValidation)
  ],
  validateRequest,
  (req: Request, res: Response) => {
    const { redirectURI } = req.query as { redirectURI: string }
    const redirectCallback = `${process.env.API_BASE_URL}/users/oauth2/${DISCORD_PROVIDER}/callback?redirectURI=${redirectURI}`
    const url = `${DISCORD_BASE_URL}/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&scope=identify&response_type=code&redirect_uri=${redirectCallback}`
    return res.json(url)
  }
)

discordRouter.get(
  `/users/oauth2/${DISCORD_PROVIDER}/callback`,
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
      `${process.env.API_BASE_URL}/users/oauth2/${DISCORD_PROVIDER}/callback?redirectURI=${redirectURI}`
    )
    const responseJWT = await discordStrategy.callbackSignin({
      name: discordUser.username,
      id: discordUser.id
    })
    return res.redirect(buildQueryURL(redirectURI, responseJWT))
  }
)
