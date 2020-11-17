import bcrypt from 'bcryptjs'
import { Request, Response, Router } from 'express'
import { body, query } from 'express-validator'
import { v4 as uuidv4 } from 'uuid'

import { validateRequest } from '../../middlewares/validateRequest'
import User from '../../models/User'
import { commonErrorsMessages } from '../../utils/config/constants'
import { alreadyUsedValidation } from '../../utils/database/alreadyUsedValidation'
import { sendConfirmEmail } from './utils/sendConfirmEmail'

export const errorsMessages = {
  email: {
    mustBeValid: 'Email must be valid'
  }
}

const signupRouter = Router()

signupRouter.post(
  '/',
  [
    body('email')
      .trim()
      .notEmpty()
      .isEmail()
      .withMessage(errorsMessages.email.mustBeValid)
      .custom(async (email: string) => {
        return await alreadyUsedValidation(User, 'email', email)
      }),
    body('name')
      .trim()
      .notEmpty()
      .isLength({ max: 30, min: 3 })
      .withMessage(
        commonErrorsMessages.charactersLength('name', { max: 30, min: 3 })
      )
      .custom(async (name: string) => {
        return await alreadyUsedValidation(User, 'name', name)
      }),
    body('password')
      .trim()
      .notEmpty(),
    query('redirectURI')
      .optional({ nullable: true })
      .trim()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body as {
      name: string
      email: string
      password: string
    }
    const { redirectURI } = req.query as { redirectURI?: string }
    const hashedPassword = await bcrypt.hash(password, 12)
    const tempToken = uuidv4()
    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      tempToken
    })
    await sendConfirmEmail({
      email,
      tempToken,
      redirectURI,
      subject: 'SocialProject - Confirm signup',
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

export { signupRouter }
