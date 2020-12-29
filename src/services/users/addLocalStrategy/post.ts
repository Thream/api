import bcrypt from 'bcryptjs'
import { Request, Response, Router } from 'express'
import { body, query } from 'express-validator'
import { v4 as uuidv4 } from 'uuid'
import { authenticateUser } from '../../../middlewares/authenticateUser'

import { validateRequest } from '../../../middlewares/validateRequest'
import User from '../../../models/User'
import { BadRequestError } from '../../../utils/errors/BadRequestError'
import { ForbiddenError } from '../../../utils/errors/ForbiddenError'
import { alreadyUsedValidation } from '../../../utils/validations/alreadyUsedValidation'
import { sendConfirmEmail } from '../__utils__/sendConfirmEmail'

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
    body('password').trim().notEmpty(),
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
    await user.save()
    await sendConfirmEmail({
      email,
      tempToken,
      redirectURI,
      subject: 'Thream - Confirm signup',
      renderOptions: {
        subtitle: 'Please confirm signup',
        buttonText: 'Yes, I signup',
        footerText:
          'If you received this message by mistake, just delete it. You will not be signed up if you do not click on the confirmation link above.'
      }
    })
    return res.status(201).json({ user })
  }
)
