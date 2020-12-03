import { Router } from 'express'

import { confirmEmailRouter } from '../controllers/users/confirmEmail'
import { currentRouter } from '../controllers/users/current'
import { discordRouter } from '../controllers/users/oauth2/discord'
import { githubRouter } from '../controllers/users/oauth2/github'
import { refreshTokenRouter } from '../controllers/users/refreshToken'
import { resetPasswordRouter } from '../controllers/users/resetPassword'
import { signinRouter } from '../controllers/users/signin'
import { signoutRouter } from '../controllers/users/signout'
import { signupRouter } from '../controllers/users/signup'

const usersRouter = Router()

usersRouter.use('/confirm-email', confirmEmailRouter)
usersRouter.use('/current', currentRouter)
usersRouter.use('/refresh-token', refreshTokenRouter)
usersRouter.use('/reset-password', resetPasswordRouter)
usersRouter.use('/signin', signinRouter)
usersRouter.use('/signout', signoutRouter)
usersRouter.use('/signup', signupRouter)

usersRouter.use('/oauth2/discord', discordRouter)
usersRouter.use('/oauth2/github', githubRouter)

export { usersRouter }
