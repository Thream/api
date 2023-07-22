import querystring from 'node:querystring'

import axios from 'axios'

import { OAuthStrategy } from '#src/tools/utils/OAuthStrategy.js'

export const GITHUB_PROVIDER = 'GitHub'
export const GITHUB_BASE_URL = 'https://github.com'
export const GITHUB_API_BASE_URL = 'https://api.github.com'
export const GITHUB_CLIENT_ID =
  process.env['GITHUB_CLIENT_ID'] ?? 'GITHUB_CLIENT_ID'
export const GITHUB_CLIENT_SECRET =
  process.env['GITHUB_CLIENT_SECRET'] ?? 'GITHUB_CLIENT_SECRET'
export const githubStrategy = new OAuthStrategy(GITHUB_PROVIDER)

export interface GitHubUser {
  login: string
  id: number
  name: string
  avatar_url: string
}

export interface GitHubTokens {
  access_token: string
  scope: string
  token_type: string
}

export const getGitHubUserData = async (
  code: string,
  redirectURI: string
): Promise<GitHubUser> => {
  const { data: token } = await axios.post<GitHubTokens>(
    `${GITHUB_BASE_URL}/login/oauth/access_token`,
    querystring.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
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
