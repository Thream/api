import { Router } from 'express'

import { confirmEmailRouter } from '../controllers/Users/confirmEmail'
import { currentRouter } from '../controllers/Users/current'
import { discordRouter } from '../controllers/Users/oauth2/discord'
import { refreshTokenRouter } from '../controllers/Users/refreshToken'
import { resetPasswordRouter } from '../controllers/Users/resetPassword'
import { signinRouter } from '../controllers/Users/signin'
import { signoutRouter } from '../controllers/Users/signout'
import { signupRouter } from '../controllers/Users/signup'

const usersRouter = Router()

usersRouter.use('/confirm-email', confirmEmailRouter)
usersRouter.use('/current', currentRouter)
usersRouter.use('/refresh-token', refreshTokenRouter)
usersRouter.use('/reset-password', resetPasswordRouter)
usersRouter.use('/signin', signinRouter)
usersRouter.use('/signout', signoutRouter)
usersRouter.use('/signup', signupRouter)

usersRouter.use('/oauth2/discord', discordRouter)

export { usersRouter }
