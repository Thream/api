import { Router } from 'express'

import { confirmEmailRouter } from './confirmEmail'
import { currentRouter } from './current'
import { discordRouter } from './oauth2/discord'
import { githubRouter } from './oauth2/github'
import { googleRouter } from './oauth2/google'
import { refreshTokenRouter } from './refreshToken'
import { resetPasswordRouter } from './resetPassword'
import { signinRouter } from './signin'
import { signoutRouter } from './signout'
import { signupRouter } from './signup'

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
