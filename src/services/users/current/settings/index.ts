import { Router } from 'express'

import { putCurrentSettingsRouter } from './put'

export const currentSettingsRouter = Router()

currentSettingsRouter.use('/', putCurrentSettingsRouter)
