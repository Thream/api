import { Router } from 'express'

import { postMessagesRouter } from './post'
import { getMessagesRouter } from './get'

export const messagesChannelsRouter = Router()

messagesChannelsRouter.use('/', postMessagesRouter)
messagesChannelsRouter.use('/', getMessagesRouter)
