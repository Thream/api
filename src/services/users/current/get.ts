import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../../tools/middlewares/authenticateUser'
import OAuth, { AuthenticationStrategy } from '../../../models/OAuth'
import UserSetting from '../../../models/UserSetting'
import { ForbiddenError } from '../../../tools/errors/ForbiddenError'

export const getCurrentRouter = Router()

getCurrentRouter.get(
  '/users/current',
  authenticateUser,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const settings = await UserSetting.findOne({
      where: { userId: req.user.current.id }
    })
    const OAuths = await OAuth.findAll({
      where: { userId: req.user.current.id }
    })
    const strategies: AuthenticationStrategy[] = OAuths.map((oauth) => {
      return oauth.provider
    })
    if (req.user.current.password != null) {
      strategies.push('local')
    }
    return res.status(200).json({
      user: req.user.current,
      settings,
      currentStrategy: req.user.currentStrategy,
      strategies
    })
  }
)
