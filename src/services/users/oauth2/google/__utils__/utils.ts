import querystring from 'node:querystring'

import axios from 'axios'

import { OAuthStrategy } from '#src/tools/utils/OAuthStrategy.js'

export const GOOGLE_PROVIDER = 'Google'
export const GOOGLE_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
export const GOOGLE_OAUTH2_TOKEN = 'https://oauth2.googleapis.com/token'
export const GOOGLE_USERINFO =
  'https://www.googleapis.com/oauth2/v1/userinfo?alt=json'
export const GOOGLE_CLIENT_ID =
  process.env['GOOGLE_CLIENT_ID'] ?? 'GOOGLE_CLIENT_ID'
export const GOOGLE_CLIENT_SECRET =
  process.env['GOOGLE_CLIENT_SECRET'] ?? 'GOOGLE_CLIENT_SECRET'
export const googleStrategy = new OAuthStrategy(GOOGLE_PROVIDER)

export interface GoogleUser {
  id: string
  name: string
  given_name: string
  link: string
  picture: string
  locale: string
}

export interface GoogleTokens {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
  refresh_token?: string
}

export const getGoogleUserData = async (
  code: string,
  redirectURI: string
): Promise<GoogleUser> => {
  const { data: token } = await axios.post<GoogleTokens>(
    GOOGLE_OAUTH2_TOKEN,
    querystring.stringify({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
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
