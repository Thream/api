import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../../tools/middlewares/authenticateUser'
import { ForbiddenError } from '../../../tools/errors/ForbiddenError'
import { deleteEveryRefreshTokens } from '../__utils__/deleteEveryRefreshTokens'

export const signoutEveryDevicesRouter = Router()

signoutEveryDevicesRouter.delete(
  '/users/signout',
  authenticateUser,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    await deleteEveryRefreshTokens(req.user.current.id)
    res.status(200).json({})
  }
)
