import { Request, Response, Router } from 'express'
import { body } from 'express-validator'

import { validateRequest } from '../../middlewares/validateRequest'
import RefreshToken from '../../models/RefreshToken'
import { UnauthorizedError } from '../../utils/errors/UnauthorizedError'

const signoutRouter = Router()

signoutRouter.post(
  '/',
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

export { signoutRouter }
