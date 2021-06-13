import { Request, Response, Router } from 'express'

import User from '../../../models/User'
import UserSetting from '../../../models/UserSetting'
import { NotFoundError } from '../../../tools/errors/NotFoundError'

export const getUsersRouter = Router()

getUsersRouter.get(
  '/users/:userId',
  [],
  async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string }
    const user = await User.findOne({ where: { id: userId } })
    if (user == null) {
      throw new NotFoundError()
    }
    const userSettings = await UserSetting.findOne({
      where: { userId: user.id }
    })
    if (userSettings == null) {
      throw new NotFoundError()
    }
    const result = Object.assign({}, user.toJSON())
    if (!userSettings.isPublicEmail) {
      delete result.email
    }
    return res.status(200).json({ user: result })
  }
)
