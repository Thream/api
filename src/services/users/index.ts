import { FastifyPluginAsync } from 'fastify'

import { postSignupUser } from './signup/post'
import { getConfirmEmail } from './confirm-email/get'
import { postSigninUser } from './signin/post'
import { postSignoutUser } from './signout/post'

export const usersService: FastifyPluginAsync = async (fastify) => {
  await fastify.register(postSignupUser)
  await fastify.register(getConfirmEmail)
  await fastify.register(postSigninUser)
  await fastify.register(postSignoutUser)
}
