import { Router } from 'express'

import { deleteByIdMessagesRouter } from './[messageId]/delete'
import { putByIdMessagesRouter } from './[messageId]/put'

export const messagesRouter = Router()

messagesRouter.use('/', deleteByIdMessagesRouter)
messagesRouter.use('/', putByIdMessagesRouter)
