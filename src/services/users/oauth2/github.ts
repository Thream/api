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

interface GitHubUser {
  login: string
  id: number
  name: string
  avatar_url: string
}

interface GitHubTokens {
  access_token: string
  scope: string
  token_type: string
}

export const GITHUB_PROVIDER = 'github'
export const GITHUB_BASE_URL = 'https://github.com'
export const GITHUB_API_BASE_URL = 'https://api.github.com'
export const githubStrategy = new OAuthStrategy(GITHUB_PROVIDER)

const getGitHubUserData = async (
  code: string,
  redirectURI: string
): Promise<GitHubUser> => {
  const { data: token } = await axios.post<GitHubTokens>(
    `${GITHUB_BASE_URL}/login/oauth/access_token`,
    querystring.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectURI
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      }
    }
  )
  const { data: githubUser } = await axios.get<GitHubUser>(
    `${GITHUB_API_BASE_URL}/user`,
    {
      headers: {
        Authorization: `token ${token.access_token}`
      }
    }
  )
  return githubUser
}

export const githubRouter = Router()

githubRouter.get(
  `/users/oauth2/${GITHUB_PROVIDER}/add-strategy`,
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
    const redirectCallback = `${process.env.API_BASE_URL}/users/oauth2/${GITHUB_PROVIDER}/callback-add-strategy?redirectURI=${redirectURI}`
    const url = `${GITHUB_BASE_URL}/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&state=${req.user.accessToken}&redirect_uri=${redirectCallback}`
    return res.json(url)
  }
)

githubRouter.get(
  `/users/oauth2/${GITHUB_PROVIDER}/callback-add-strategy`,
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
    const githubUser = await getGitHubUserData(
      code,
      `${process.env.API_BASE_URL}/users/oauth2/${GITHUB_PROVIDER}/callback-add-strategy?redirectURI=${redirectURI}`
    )
    const message = await githubStrategy.callbackAddStrategy(
      { name: githubUser.name, id: githubUser.id },
      userRequest
    )
    return res.redirect(buildQueryURL(redirectURI, { message }))
  }
)

githubRouter.get(
  `/users/oauth2/${GITHUB_PROVIDER}/signin`,
  [
    query('redirectURI')
      .notEmpty()
      .trim()
      .custom(isValidRedirectURIValidation)
  ],
  validateRequest,
  (req: Request, res: Response) => {
    const { redirectURI } = req.query as { redirectURI: string }
    const redirectCallback = `${process.env.API_BASE_URL}/users/oauth2/${GITHUB_PROVIDER}/callback?redirectURI=${redirectURI}`
    const url = `${GITHUB_BASE_URL}/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectCallback}`
    return res.json(url)
  }
)

githubRouter.get(
  `/users/oauth2/${GITHUB_PROVIDER}/callback`,
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
    const githubUser = await getGitHubUserData(
      code,
      `${process.env.API_BASE_URL}/users/oauth2/${GITHUB_PROVIDER}/callback?redirectURI=${redirectURI}`
    )
    const responseJWT = await githubStrategy.callbackSignin({
      name: githubUser.name,
      id: githubUser.id
    })
    return res.redirect(buildQueryURL(redirectURI, responseJWT))
  }
)
