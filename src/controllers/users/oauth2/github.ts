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

const GITHUB_PROVIDER = 'github'
const GITHUB_BASE_URL = 'https://github.com'
const GITHUB_API_BASE_URL = 'https://api.github.com'

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

const githubRouter = Router()

githubRouter.get(
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
    const redirectCallback = `${process.env.API_BASE_URL}/users/oauth2/${GITHUB_PROVIDER}/callback-add-strategy?redirectURI=${redirectURI}`
    const url = `${GITHUB_BASE_URL}/oauth2/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=identify&response_type=code&state=${req.user.accessToken}&redirect_uri=${redirectCallback}`
    return res.json(url)
  }
)

githubRouter.get(
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
    const githubUser = await getGitHubUserData(
      code,
      `${process.env.API_BASE_URL}/users/oauth2/${GITHUB_PROVIDER}/callback-add-strategy?redirectURI=${redirectURI}`
    )
    const OAuthUser = await OAuth.findOne({
      where: { providerId: githubUser.id, provider: GITHUB_PROVIDER }
    })
    let message = 'success'

    if (OAuthUser == null) {
      await OAuth.create({
        provider: GITHUB_PROVIDER,
        providerId: githubUser.id,
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

githubRouter.get(
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
    const redirectCallback = `${process.env.API_BASE_URL}/users/oauth2/${GITHUB_PROVIDER}/callback?redirectURI=${redirectURI}`
    const url = `${GITHUB_BASE_URL}/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectCallback}`
    return res.json(url)
  }
)

githubRouter.get(
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
    const githubUser = await getGitHubUserData(
      code,
      `${process.env.API_BASE_URL}/users/oauth2/${GITHUB_PROVIDER}/callback?redirectURI=${redirectURI}`
    )
    const OAuthUser = await OAuth.findOne({
      where: { providerId: githubUser.id, provider: GITHUB_PROVIDER }
    })
    let userId: number = OAuthUser?.userId ?? 0

    if (OAuthUser == null) {
      let name = githubUser.name
      let isAlreadyUsedName = true
      let countId: string | number = githubUser.id
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
        provider: GITHUB_PROVIDER,
        providerId: githubUser.id,
        userId: user.id
      })
    }

    const accessToken = generateAccessToken({
      id: userId,
      strategy: GITHUB_PROVIDER
    })
    const refreshToken = await generateRefreshToken({
      strategy: GITHUB_PROVIDER,
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

export { githubRouter }
