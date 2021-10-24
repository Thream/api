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

interface GoogleUser {
  id: string
  name: string
  given_name: string
  link: string
  picture: string
  locale: string
}

interface GoogleTokens {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
  refresh_token?: string
}

export const GOOGLE_PROVIDER = 'google'
export const GOOGLE_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
export const GOOGLE_OAUTH2_TOKEN = 'https://oauth2.googleapis.com/token'
export const GOOGLE_USERINFO = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json'
export const googleStrategy = new OAuthStrategy(GOOGLE_PROVIDER)

const getGoogleUserData = async (
  code: string,
  redirectURI: string
): Promise<GoogleUser> => {
  const { data: token } = await axios.post<GoogleTokens>(
    GOOGLE_OAUTH2_TOKEN,
    querystring.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: redirectURI,
      grant_type: 'authorization_code'
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      }
    }
  )
  const { data: googleUser } = await axios.get<GoogleUser>(
    `${GOOGLE_USERINFO}&access_token=${token.access_token}`
  )
  return googleUser
}

export const googleRouter = Router()

googleRouter.get(
  `/users/oauth2/${GOOGLE_PROVIDER}/add-strategy`,
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
    const redirectCallback = `${process.env.API_BASE_URL}/users/oauth2/${GOOGLE_PROVIDER}/callback-add-strategy?redirectURI=${redirectURI}`
    const url = `${GOOGLE_BASE_URL}?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectCallback}&response_type=code&scope=profile&access_type=online&state=${req.user.accessToken}`
    return res.json(url)
  }
)

googleRouter.get(
  `/users/oauth2/${GOOGLE_PROVIDER}/callback-add-strategy`,
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
    const googleUser = await getGoogleUserData(
      code,
      `${process.env.API_BASE_URL}/users/oauth2/${GOOGLE_PROVIDER}/callback-add-strategy?redirectURI=${redirectURI}`
    )
    const message = await googleStrategy.callbackAddStrategy(
      { name: googleUser.name, id: googleUser.id },
      userRequest
    )
    return res.redirect(buildQueryURL(redirectURI, { message }))
  }
)

googleRouter.get(
  `/users/oauth2/${GOOGLE_PROVIDER}/signin`,
  [
    query('redirectURI')
      .notEmpty()
      .trim()
      .custom(isValidRedirectURIValidation)
  ],
  validateRequest,
  (req: Request, res: Response) => {
    const { redirectURI } = req.query as { redirectURI: string }
    const redirectCallback = `${process.env.API_BASE_URL}/users/oauth2/${GOOGLE_PROVIDER}/callback?redirectURI=${redirectURI}`
    const url = `${GOOGLE_BASE_URL}?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectCallback}&response_type=code&scope=profile&access_type=online`
    return res.json(url)
  }
)

googleRouter.get(
  `/users/oauth2/${GOOGLE_PROVIDER}/callback`,
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
    const googleUser = await getGoogleUserData(
      code,
      `${process.env.API_BASE_URL}/users/oauth2/${GOOGLE_PROVIDER}/callback?redirectURI=${redirectURI}`
    )
    const responseJWT = await googleStrategy.callbackSignin({
      name: googleUser.name,
      id: googleUser.id
    })
    return res.redirect(buildQueryURL(redirectURI, responseJWT))
  }
)
