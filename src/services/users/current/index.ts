import { Router } from 'express'

import { getCurrentRouter } from './get'
import { putCurrentRouter } from './put'
import { currentSettingsRouter } from './settings'

export const currentRouter = Router()

export const errorsMessages = {
  email: {
    mustBeValid: 'Email must be valid',
    alreadyConnected: 'You are already connected with this email address'
  },
  name: {
    alreadyConnected: 'You are already connected with this name'
  }
}

currentRouter.use('/', getCurrentRouter)
currentRouter.use('/', putCurrentRouter)
currentRouter.use('/', currentSettingsRouter)
