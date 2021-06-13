import { Request, Response, Router } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'

import { validateRequest } from '../../../tools/middlewares/validateRequest'
import RefreshToken from '../../../models/RefreshToken'
import { UserJWT } from '../../../models/User'
import {
  expiresIn,
  generateAccessToken,
  ResponseJWT
} from '../../../tools/configurations/jwtToken'
import { ForbiddenError } from '../../../tools/errors/ForbiddenError'
import { UnauthorizedError } from '../../../tools/errors/UnauthorizedError'

export const refreshTokenRouter = Router()

refreshTokenRouter.post(
  '/users/refreshToken',
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
          currentStrategy: userJWT.currentStrategy
        })
        const responseJWT: ResponseJWT = {
          accessToken,
          expiresIn,
          type: 'Bearer'
        }
        return res.status(200).json(responseJWT)
      }
    )
  }
)
