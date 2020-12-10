import { Router } from 'express'

import { confirmEmailRouter } from './confirmEmail'
import { currentRouter } from './current'
import { OAuth2Router } from './oauth2'
import { refreshTokenRouter } from './refreshToken'
import { resetPasswordRouter } from './reset-password'
import { signinRouter } from './signin'
import { signoutRouter } from './signout'
import { signupRouter } from './signup'

export const usersRouter = Router()

usersRouter.use('/', confirmEmailRouter)
usersRouter.use('/', currentRouter)
usersRouter.use('/', refreshTokenRouter)
usersRouter.use('/', resetPasswordRouter)
usersRouter.use('/', signinRouter)
usersRouter.use('/', signoutRouter)
usersRouter.use('/', signupRouter)
usersRouter.use('/', OAuth2Router)
