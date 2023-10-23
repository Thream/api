import querystring from "node:querystring"

import axios from "axios"

import { OAuthStrategy } from "#src/tools/utils/OAuthStrategy.js"

export const DISCORD_PROVIDER = "Discord"
export const DISCORD_BASE_URL = "https://discord.com/api/v10"
export const DISCORD_CLIENT_ID =
  process.env["DISCORD_CLIENT_ID"] ?? "DISCORD_CLIENT_ID"
export const DISCORD_CLIENT_SECRET =
  process.env["DISCORD_CLIENT_SECRET"] ?? "DISCORD_CLIENT_SECRET"
export const discordStrategy = new OAuthStrategy(DISCORD_PROVIDER)

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar?: string
  locale?: string
}

export interface DiscordTokens {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

export const getDiscordUserData = async (
  code: string,
  redirectURI: string,
): Promise<DiscordUser> => {
  const { data: tokens } = await axios.post<DiscordTokens>(
    `${DISCORD_BASE_URL}/oauth2/token`,
    querystring.stringify({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectURI,
      scope: "identify",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  )
  const { data: discordUser } = await axios.get<DiscordUser>(
    `${DISCORD_BASE_URL}/users/@me`,
    {
      headers: {
        Authorization: `${tokens.token_type} ${tokens.access_token}`,
      },
    },
  )
  return discordUser
}
