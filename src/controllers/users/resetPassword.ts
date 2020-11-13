import bcrypt from 'bcryptjs'
import ejs from 'ejs'
import { Request, Response, Router } from 'express'
import { body, query } from 'express-validator'
import ms from 'ms'
import { v4 as uuidv4 } from 'uuid'

import { errorsMessages as errorsConfirmed } from '../../middlewares/authenticateUser'
import { validateRequest } from '../../middlewares/validateRequest'
import User from '../../models/User'
import { emailTemplatePath } from '../../utils/config/constants'
import {
  EMAIL_INFO,
  emailTransporter
} from '../../utils/config/emailTransporter'
import { BadRequestError } from '../../utils/errors/BadRequestError'

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

const resetPasswordRouter = Router()

resetPasswordRouter.post(
  '/',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage(errorsMessages.email.mustBeValid),
    query('redirectURI')
      .notEmpty()
      .trim()
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
    const maximumTimeToResetPassword = '1 hour'
    user.tempToken = tempToken
    user.tempExpirationToken = Date.now() + ms(maximumTimeToResetPassword)
    await user.save()

    const emailHTML = await ejs.renderFile(emailTemplatePath, {
      subtitle: 'Please confirm password reset',
      buttonText: 'Yes, I change my password',
      url: `${redirectURI}?tempToken=${tempToken}`,
      footerText: `If you received this message by mistake, just delete it. Your password will not be reset if you do not click on the link above. Also, for the security of your account, the password reset is available for a period of ${maximumTimeToResetPassword}, pass this time, the reset will no longer be valid.`
    })
    await emailTransporter.sendMail({
      from: `"SocialProject" <${EMAIL_INFO.auth.user}>`,
      to: email,
      subject: 'SocialProject - Reset password',
      html: emailHTML
    })

    return res.status(200).json({
      message: 'Password-reset request successful, please check your emails!'
    })
  }
)

resetPasswordRouter.put(
  '/',
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

export { resetPasswordRouter }
