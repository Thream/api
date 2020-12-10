import { Router } from 'express'

import { confirmEmailRouter } from '../controllers/users/confirmEmail'
import { currentRouter } from '../controllers/users/current'
import { discordRouter } from '../controllers/users/oauth2/discord'
import { githubRouter } from '../controllers/users/oauth2/github'
import { googleRouter } from '../controllers/users/oauth2/google'
import { refreshTokenRouter } from '../controllers/users/refreshToken'
import { resetPasswordRouter } from '../controllers/users/resetPassword'
import { signinRouter } from '../controllers/users/signin'
import { signoutRouter } from '../controllers/users/signout'
import { signupRouter } from '../controllers/users/signup'

const usersRouter = Router()

usersRouter.use('/', confirmEmailRouter)
usersRouter.use('/', currentRouter)
usersRouter.use('/', refreshTokenRouter)
usersRouter.use('/', resetPasswordRouter)
usersRouter.use('/', signinRouter)
usersRouter.use('/', signoutRouter)
usersRouter.use('/', signupRouter)

usersRouter.use('/', discordRouter)
usersRouter.use('/', githubRouter)
usersRouter.use('/', googleRouter)

export { usersRouter }
