import bcrypt from 'bcryptjs'
import { Request, Response, Router } from 'express'
import { body } from 'express-validator'

import { validateRequest } from '../../../tools/middlewares/validateRequest'
import User from '../../../models/User'
import { BadRequestError } from '../../../tools/errors/BadRequestError'

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

export const putResetPasswordRouter = Router()

putResetPasswordRouter.put(
  '/users/resetPassword',
  [
    body('password')
      .trim()
      .notEmpty(),
    body('tempToken')
      .trim()
      .notEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { password, tempToken } = req.body as {
      password: string
      tempToken: string
    }
    const user = await User.findOne({ where: { tempToken } })
    const isValidTempToken =
      user?.tempExpirationToken != null && user.tempExpirationToken > Date.now()
    if (user == null || !isValidTempToken) {
      throw new BadRequestError(errorsMessages.tempToken.invalid)
    }
    const hashedPassword = await bcrypt.hash(password, 12)
    user.password = hashedPassword
    user.tempToken = null
    user.tempExpirationToken = null
    await user.save()
    return res.status(200).json({ message: 'The new password has been saved!' })
  }
)
