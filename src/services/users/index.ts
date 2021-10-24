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
}
