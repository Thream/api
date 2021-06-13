import bcrypt from 'bcryptjs'
import { Request, Response, Router } from 'express'
import { body } from 'express-validator'

import { validateRequest } from '../../../tools/middlewares/validateRequest'
import User from '../../../models/User'
import {
  expiresIn,
  generateAccessToken,
  generateRefreshToken,
  ResponseJWT
} from '../../../tools/configurations/jwtToken'
import { BadRequestError } from '../../../tools/errors/BadRequestError'

export const errorsMessages = {
  email: {
    mustBeValid: 'Email must be valid'
  },
  password: {
    required: 'Password is required'
  },
  invalidCredentials: 'Invalid credentials'
}

export const signinRouter = Router()

signinRouter.post(
  '/users/signin',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage(errorsMessages.email.mustBeValid),
    body('password')
      .notEmpty()
      .withMessage(errorsMessages.password.required)
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body as {
      email: string
      password: string
    }
    const user = await User.findOne({ where: { email, isConfirmed: true } })
    if (user == null) {
      throw new BadRequestError(errorsMessages.invalidCredentials)
    }

    if (user.password == null) {
      throw new BadRequestError(errorsMessages.invalidCredentials)
    }
    const isCorrectPassword = await bcrypt.compare(password, user.password)
    if (!isCorrectPassword) {
      throw new BadRequestError(errorsMessages.invalidCredentials)
    }
    const accessToken = generateAccessToken({
      currentStrategy: 'local',
      id: user.id
    })
    const refreshToken = await generateRefreshToken({
      currentStrategy: 'local',
      id: user.id
    })
    const responseJWT: ResponseJWT = {
      accessToken,
      refreshToken,
      expiresIn,
      type: 'Bearer'
    }
    return res.status(200).json(responseJWT)
  }
)
