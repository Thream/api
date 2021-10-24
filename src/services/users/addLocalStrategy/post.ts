import bcrypt from 'bcryptjs'
import { Request, Response, Router } from 'express'
import { body, query } from 'express-validator'
import { v4 as uuidv4 } from 'uuid'
import { authenticateUser } from '../../../tools/middlewares/authenticateUser'

import { validateRequest } from '../../../tools/middlewares/validateRequest'
import User from '../../../models/User'
import UserSetting from '../../../models/UserSetting'
import { sendEmail } from '../../../tools/email/sendEmail'
import { BadRequestError } from '../../../tools/errors/BadRequestError'
import { ForbiddenError } from '../../../tools/errors/ForbiddenError'
import { alreadyUsedValidation } from '../../../tools/validations/alreadyUsedValidation'

export const errorsMessages = {
  email: {
    mustBeValid: 'Email must be valid',
    alreadyConnected: 'You are already connected with this email address'
  }
}

export const addLocalStrategyRouter = Router()

addLocalStrategyRouter.post(
  '/users/addLocalStrategy',
  authenticateUser,
  [
    body('email')
      .trim()
      .notEmpty()
      .isEmail()
      .withMessage(errorsMessages.email.mustBeValid)
      .custom(async (email: string, meta) => {
        if (email === meta.req.user?.current.email) {
          return await Promise.reject(
            new Error(errorsMessages.email.alreadyConnected)
          )
        }
        return await alreadyUsedValidation(User, 'email', email)
      }),
    body('password').trim().notEmpty().isString(),
    query('redirectURI').optional({ nullable: true }).trim()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const { email, password } = req.body as {
      email: string
      password: string
    }
    const { redirectURI } = req.query as { redirectURI?: string }
    if (req.user.currentStrategy === 'local' || user.password != null) {
      throw new BadRequestError('You are already using local strategy')
    }
    const hashedPassword = await bcrypt.hash(password, 12)
    const tempToken = uuidv4()
    user.email = email
    user.password = hashedPassword
    user.tempToken = tempToken
    user.isConfirmed = false
    await user.save()
    const userSettings = await UserSetting.findOne({
      where: { userId: user.id }
    })
    const redirectQuery =
      redirectURI != null ? `&redirectURI=${redirectURI}` : ''
    await sendEmail({
      type: 'confirm-email',
      email,
      url: `${process.env.API_BASE_URL}/users/confirmEmail?tempToken=${tempToken}${redirectQuery}`,
      language: userSettings?.language,
      theme: userSettings?.theme
    })
    return res.status(201).json({ user })
  }
)
