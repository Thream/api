import { Router } from 'express'

import { getChannelsRouter } from './get'
import { postChannelsRouter } from './post'

export const guildsChannelsRouter = Router()

guildsChannelsRouter.use('/', getChannelsRouter)
guildsChannelsRouter.use('/', postChannelsRouter)
