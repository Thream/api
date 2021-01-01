import { Request, Response, Router } from 'express'
import { body, query } from 'express-validator'
import ms from 'ms'
import { v4 as uuidv4 } from 'uuid'

import { errorsMessages as errorsConfirmed } from '../../../tools/middlewares/authenticateUser'
import { validateRequest } from '../../../tools/middlewares/validateRequest'
import User from '../../../models/User'
import UserSetting from '../../../models/UserSetting'
import { sendEmail } from '../../../tools/email/sendEmail'
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

export const postResetPasswordRouter = Router()

postResetPasswordRouter.post(
  '/users/resetPassword',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage(errorsMessages.email.mustBeValid),
    query('redirectURI').notEmpty().trim()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body as { email: string }
    const { redirectURI } = req.query as { redirectURI: string }

    const user = await User.findOne({ where: { email } })
    if (user == null) {
      throw new BadRequestError(errorsMessages.email.notExist)
    }
    if (!user.isConfirmed) {
      throw new BadRequestError(errorsConfirmed.invalidAccount)
    }
    const isValidTempToken =
      user.tempExpirationToken != null && user.tempExpirationToken > Date.now()
    if (user.tempToken != null && isValidTempToken) {
      throw new BadRequestError(errorsMessages.password.alreadyInProgress)
    }

    const tempToken = uuidv4()
    user.tempToken = tempToken
    user.tempExpirationToken = Date.now() + ms('1 hour')
    await user.save()
    const userSettings = await UserSetting.findOne({
      where: { userId: user.id }
    })
    await sendEmail({
      type: 'reset-password',
      email,
      url: `${redirectURI}?tempToken=${tempToken}`,
      language: userSettings?.language,
      theme: userSettings?.theme
    })
    return res.status(200).json({
      message: 'Password-reset request successful, please check your emails!'
    })
  }
)
