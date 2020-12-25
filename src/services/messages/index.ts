import { Router } from 'express'

import { deleteByIdMessagesRouter } from './:messageId/delete'
import { putMessagesRouter } from './:messageId/put'

export const messagesRouter = Router()

messagesRouter.use('/', deleteByIdMessagesRouter)
messagesRouter.use('/', putMessagesRouter)
