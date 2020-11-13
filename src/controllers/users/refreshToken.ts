import { Request, Response, Router } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'

import { validateRequest } from '../../middlewares/validateRequest'
import RefreshToken from '../../models/RefreshToken'
import { UserJWT } from '../../models/User'
import { expiresIn, generateAccessToken } from '../../utils/config/jwtToken'
import { ForbiddenError } from '../../utils/errors/ForbiddenError'
import { UnauthorizedError } from '../../utils/errors/UnauthorizedError'

const refreshTokenRouter = Router()

refreshTokenRouter.post(
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

    jwt.verify(
      foundRefreshToken.token,
      process.env.JWT_REFRESH_SECRET,
      (error, user) => {
        if (error != null) {
          throw new ForbiddenError()
        }
        const userJWT = user as UserJWT
        const accessToken = generateAccessToken({
          id: userJWT.id,
          strategy: userJWT.strategy
        })
        return res.status(200).json({
          accessToken,
          expiresIn,
          type: 'Bearer'
        })
      }
    )
  }
)

export { refreshTokenRouter }
