import { Router } from 'express'

import { signoutEveryDevicesRouter } from './delete'
import { postSignoutRouter } from './post'

export const signoutRouter = Router()

signoutRouter.use('/', signoutEveryDevicesRouter)
signoutRouter.use('/', postSignoutRouter)
