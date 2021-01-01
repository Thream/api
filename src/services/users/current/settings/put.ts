import { Request, Response, Router } from 'express'
import { body } from 'express-validator'

import { authenticateUser } from '../../../../tools/middlewares/authenticateUser'
import { validateRequest } from '../../../../tools/middlewares/validateRequest'
import UserSetting, {
  themes,
  Theme,
  languages,
  Language
} from '../../../../models/UserSetting'
import { ForbiddenError } from '../../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../../tools/errors/NotFoundError'
import { onlyPossibleValuesValidation } from '../../../../tools/validations/onlyPossibleValuesValidation'

export const putCurrentSettingsRouter = Router()

putCurrentSettingsRouter.put(
  '/users/current/settings',
  authenticateUser,
  [
    body('isPublicEmail').optional({ nullable: true }).isBoolean(),
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
      })
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const { isPublicEmail, theme, language } = req.body as {
      isPublicEmail?: boolean
      theme?: Theme
      language?: Language
    }
    const user = req.user.current
    const settings = await UserSetting.findOne({ where: { id: user.id } })
    if (settings == null) {
      throw new NotFoundError()
    }
    settings.isPublicEmail = isPublicEmail ?? settings.isPublicEmail
    settings.theme = theme ?? settings.theme
    settings.language = language ?? settings.language
    await settings.save()
    return res.status(200).json({ settings })
  }
)
