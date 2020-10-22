import { Request, Response, Router } from 'express'
import { query } from 'express-validator'

import { validateRequest } from '../../middlewares/validateRequest'
import User from '../../models/User'
import { authorizedRedirectDomains } from '../../utils/config/constants'
import { ForbiddenError } from '../../utils/errors/ForbiddenError'

const confirmEmailRouter = Router()

confirmEmailRouter.get(
  '/',
  [
    query('tempToken')
      .trim()
      .notEmpty(),
    query('redirectURI')
      .optional({ nullable: true })
      .trim()
      .custom(async (redirectURI: string) => {
        const isValidRedirectURI = authorizedRedirectDomains.some(domain => {
          return redirectURI.startsWith(domain)
        })
        if (!isValidRedirectURI) {
          return await Promise.reject(new Error('Untrusted URL redirection'))
        }
        return true
      })
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

export { confirmEmailRouter }
