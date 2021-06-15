import { FastifyPluginAsync } from 'fastify'

import { postSignupUser } from './signup/post'
import { getConfirmEmail } from './confirm-email/get'
import { postSigninUser } from './signin/post'
import { postSignoutUser } from './signout/post'
import { deleteSignoutUser } from './signout/delete'
import { postRefreshTokenUser } from './refresh-token/post'
import { putResetPasswordUser } from './reset-password/put'
import { postResetPasswordUser } from './reset-password/post'

export const usersService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(postSignupUser)
  await fastify.register(getConfirmEmail)
  await fastify.register(postSigninUser)
  await fastify.register(postSignoutUser)
  await fastify.register(deleteSignoutUser)
  await fastify.register(postRefreshTokenUser)
  await fastify.register(putResetPasswordUser)
  await fastify.register(postResetPasswordUser)
}
