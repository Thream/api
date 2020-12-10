import { Router } from 'express'

import { postResetPasswordRouter } from './post'
import { putResetPasswordRouter } from './put'

export const resetPasswordRouter = Router()

export const errorsMessages = {
  email: {
    mustBeValid: 'Email must be valid',
    notExist: "Email address doesn't exist"
  },
  password: {
    alreadyInProgress: 'A request to reset-password is already in progress'
  },
  tempToken: {
    invalid: '"tempToken" is invalid'
  }
}

resetPasswordRouter.use('/', putResetPasswordRouter)
resetPasswordRouter.use('/', postResetPasswordRouter)
