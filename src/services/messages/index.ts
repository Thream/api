import { Router } from 'express'

import { deleteByIdMessagesRouter } from './:messageId/delete'

export const messagesRouter = Router()

messagesRouter.use('/', deleteByIdMessagesRouter)
