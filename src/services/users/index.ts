import { Router } from 'express'

import { confirmEmailRouter } from './confirmEmail/get'
import { currentRouter } from './current'
import { OAuth2Router } from './oauth2'
import { refreshTokenRouter } from './refreshToken/post'
import { resetPasswordRouter } from './resetPassword'
import { signinRouter } from './signin/post'
import { signoutRouter } from './signout'
import { signupRouter } from './signup/post'
import { usersGetByIdRouter } from './[userId]'
import { addLocalStrategyRouter } from './addLocalStrategy/post'

export const usersRouter = Router()

usersRouter.use('/', confirmEmailRouter)
usersRouter.use('/', currentRouter)
usersRouter.use('/', refreshTokenRouter)
usersRouter.use('/', resetPasswordRouter)
usersRouter.use('/', signinRouter)
usersRouter.use('/', signoutRouter)
usersRouter.use('/', signupRouter)
usersRouter.use('/', OAuth2Router)
usersRouter.use('/', usersGetByIdRouter)
usersRouter.use('/', signoutRouter)
usersRouter.use('/', addLocalStrategyRouter)
