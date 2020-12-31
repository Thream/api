import { Request, Response, Router } from 'express'
import { body } from 'express-validator'

import { validateRequest } from '../../../tools/middlewares/validateRequest'
import RefreshToken from '../../../models/RefreshToken'
import { UnauthorizedError } from '../../../tools/errors/UnauthorizedError'

export const postSignoutRouter = Router()

postSignoutRouter.post(
  '/users/signout',
  [
    body('refreshToken')
      .trim()
      .notEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body as { refreshToken: string }
    const foundRefreshToken = await RefreshToken.findOne({
      where: { token: refreshToken }
    })
    if (foundRefreshToken == null) {
      throw new UnauthorizedError()
    }
    await foundRefreshToken.destroy()
    res.status(200).json({})
  }
)
