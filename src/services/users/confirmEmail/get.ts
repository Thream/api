import { Request, Response, Router } from 'express'
import { query } from 'express-validator'

import { validateRequest } from '../../../tools/middlewares/validateRequest'
import User from '../../../models/User'
import { ForbiddenError } from '../../../tools/errors/ForbiddenError'
import { isValidRedirectURIValidation } from '../../../tools/validations/isValidRedirectURIValidation'

export const confirmEmailRouter = Router()

confirmEmailRouter.get(
  '/users/confirmEmail',
  [
    query('tempToken')
      .trim()
      .notEmpty(),
    query('redirectURI')
      .optional({ nullable: true })
      .trim()
      .custom(isValidRedirectURIValidation)
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { tempToken, redirectURI } = req.query as {
      tempToken: string
      redirectURI?: string
    }

    const user = await User.findOne({
      where: { tempToken, isConfirmed: false }
    })
    if (user == null) {
      throw new ForbiddenError()
    }

    user.tempToken = null
    user.isConfirmed = true
    await user.save()

    if (redirectURI == null) {
      return res
        .status(200)
        .json('Success, your email has been confirmed, you can now signin!')
    }

    return res.redirect(redirectURI)
  }
)
