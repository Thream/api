import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../../middlewares/authenticateUser'

export const errorsMessages = {
  email: {
    mustBeValid: 'Email must be valid',
    alreadyConnected: 'You are already connected with this email address'
  },
  name: {
    alreadyConnected: 'You are already connected with this name'
  }
}

export const getCurrentRouter = Router()

getCurrentRouter.get(
  '/users/current',
  authenticateUser,
  (req: Request, res: Response) => {
    return res
      .status(200)
      .json({ user: req.user?.current, strategy: req.user?.strategy })
  }
)
