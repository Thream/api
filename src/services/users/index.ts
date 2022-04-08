import { FastifyPluginAsync } from 'fastify'

import { postSignupUser } from './signup/post.js'
import { getConfirmEmail } from './confirm-email/get.js'
import { postSigninUser } from './signin/post.js'
import { postSignoutUser } from './signout/post.js'
import { deleteSignoutUser } from './signout/delete.js'
import { postRefreshTokenUser } from './refresh-token/post.js'
import { putResetPasswordUser } from './reset-password/put.js'
import { postResetPasswordUser } from './reset-password/post.js'
import { getCurrentUser } from './current/get.js'
import { putCurrentUser } from './current/put.js'
import { putCurrentUserSettings } from './current/settings/put.js'
import { getUserById } from './[userId]/get.js'
import { putCurrentUserLogo } from './current/logo/put.js'
import { getSigninDiscordOAuth2Service } from './oauth2/discord/signin/get.js'
import { getCallbackDiscordOAuth2Service } from './oauth2/discord/callback/get.js'
import { getSigninGoogleOAuth2Service } from './oauth2/google/signin/get.js'
import { getCallbackGoogleOAuth2Service } from './oauth2/google/callback/get.js'
import { getSigninGitHubOAuth2Service } from './oauth2/github/signin/get.js'
import { getCallbackGitHubOAuth2Service } from './oauth2/github/callback/get.js'
import { deleteProviderService } from './oauth2/[provider]/delete.js'
import { getCallbackAddStrategyDiscordOAuth2Service } from './oauth2/discord/callback-add-strategy/get.js'
import { getAddStrategyDiscordOAuth2Service } from './oauth2/discord/add-strategy/get.js'
import { getAddStrategyGitHubOAuth2Service } from './oauth2/github/add-strategy/get.js'
import { getCallbackAddStrategyGitHubOAuth2Service } from './oauth2/github/callback-add-strategy/get.js'
import { getCallbackAddStrategyGoogleOAuth2Service } from './oauth2/google/callback-add-strategy/get.js'
import { getAddStrategyGoogleOAuth2Service } from './oauth2/google/add-strategy/get.js'

export const usersService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(postSignupUser)
  await fastify.register(getConfirmEmail)
  await fastify.register(postSigninUser)
  await fastify.register(postSignoutUser)
  await fastify.register(deleteSignoutUser)
  await fastify.register(postRefreshTokenUser)
  await fastify.register(putResetPasswordUser)
  await fastify.register(postResetPasswordUser)
  await fastify.register(getCurrentUser)
  await fastify.register(putCurrentUser)
  await fastify.register(putCurrentUserSettings)
  await fastify.register(putCurrentUserLogo)
  await fastify.register(getUserById)

  await fastify.register(getSigninDiscordOAuth2Service)
  await fastify.register(getCallbackDiscordOAuth2Service)
  await fastify.register(getCallbackAddStrategyDiscordOAuth2Service)
  await fastify.register(getAddStrategyDiscordOAuth2Service)

  await fastify.register(getSigninGoogleOAuth2Service)
  await fastify.register(getCallbackGoogleOAuth2Service)
  await fastify.register(getCallbackAddStrategyGoogleOAuth2Service)
  await fastify.register(getAddStrategyGoogleOAuth2Service)

  await fastify.register(getSigninGitHubOAuth2Service)
  await fastify.register(getCallbackGitHubOAuth2Service)
  await fastify.register(getCallbackAddStrategyGitHubOAuth2Service)
  await fastify.register(getAddStrategyGitHubOAuth2Service)

  await fastify.register(deleteProviderService)
}
