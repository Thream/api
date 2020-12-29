import { Request, Response, Router } from 'express'
import { param } from 'express-validator'

import { authenticateUser } from '../../../middlewares/authenticateUser'
import { validateRequest } from '../../../middlewares/validateRequest'
import OAuth, {
  AuthenticationStrategy,
  ProviderOAuth,
  providers
} from '../../../models/OAuth'
import { BadRequestError } from '../../../utils/errors/BadRequestError'
import { ForbiddenError } from '../../../utils/errors/ForbiddenError'
import { onlyPossibleValuesValidation } from '../../../utils/validations/onlyPossibleValuesValidation'

export const deleteOAuthStrategy = Router()

deleteOAuthStrategy.delete(
  '/users/oauth2/:provider',
  authenticateUser,
  [
    param('provider')
      .trim()
      .isString()
      .custom(async (provider: ProviderOAuth) => {
        return await onlyPossibleValuesValidation(
          providers,
          'provider',
          provider
        )
      })
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const { provider } = req.params as { provider: ProviderOAuth }
    const OAuths = await OAuth.findAll({
      where: { userId: user.id }
    })
    const strategies: AuthenticationStrategy[] = OAuths.map((oauth) => {
      return oauth.provider
    })
    if (req.user.current.password != null) {
      strategies.push('local')
    }
    const oauthProvider = OAuths.find((oauth) => oauth.provider === provider)
    if (oauthProvider == null) {
      throw new BadRequestError('You are not using this provider')
    }
    const hasOthersWayToAuthenticate = strategies.length >= 2
    if (!hasOthersWayToAuthenticate) {
      throw new BadRequestError(
        "You can't delete your only way to authenticate"
      )
    }
    await oauthProvider.destroy()
    return res.status(200).json({
      message: `Success, you will not be able to login with ${oauthProvider.provider} anymore.`
    })
  }
)
