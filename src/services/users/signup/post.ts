import bcrypt from 'bcryptjs'
import { Request, Response, Router } from 'express'
import { body, query } from 'express-validator'
import { v4 as uuidv4 } from 'uuid'

import { validateRequest } from '../../../tools/middlewares/validateRequest'
import User from '../../../models/User'
import UserSetting, {
  Language,
  languages,
  Theme,
  themes
} from '../../../models/UserSetting'
import { commonErrorsMessages } from '../../../tools/configurations/constants'
import { sendEmail } from '../../../tools/email/sendEmail'
import { alreadyUsedValidation } from '../../../tools/validations/alreadyUsedValidation'
import { onlyPossibleValuesValidation } from '../../../tools/validations/onlyPossibleValuesValidation'

export const errorsMessages = {
  email: {
    mustBeValid: 'Email must be valid'
  }
}

export const signupRouter = Router()

signupRouter.post(
  '/users/signup',
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
    body('password').trim().notEmpty().isString(),
    body('theme')
      .optional({ nullable: true })
      .trim()
      .isString()
      .custom(async (theme: Theme) => {
        return await onlyPossibleValuesValidation([...themes], 'theme', theme)
      }),
    body('language')
      .optional({ nullable: true })
      .trim()
      .isString()
      .custom(async (language: Language) => {
        return await onlyPossibleValuesValidation(
          languages,
          'language',
          language
        )
      }),
    query('redirectURI').optional({ nullable: true }).trim()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { name, email, password, theme, language } = req.body as {
      name: string
      email: string
      password: string
      theme?: Theme
      language?: Language
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
    const userSettings = await UserSetting.create({
      userId: user.id,
      theme: theme ?? 'dark',
      language: language ?? 'en'
    })
    const redirectQuery = redirectURI != null ? `&redirectURI=${redirectURI}` : ''
    await sendEmail({
      type: 'confirm-email',
      email,
      url: `${process.env.API_BASE_URL}/users/confirmEmail?tempToken=${tempToken}${redirectQuery}`,
      language: userSettings.language,
      theme: userSettings.theme
    })
    return res.status(201).json({ user })
  }
)
