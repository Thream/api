import { Router } from 'express'

import { deleteByIdChannelsRouter } from './[channelId]/delete'
import { messagesChannelsRouter } from './[channelId]/messages'
import { putByIdChannelsRouter } from './[channelId]/put'

export const channelsRouter = Router()

channelsRouter.use('/', deleteByIdChannelsRouter)
channelsRouter.use('/', putByIdChannelsRouter)
channelsRouter.use('/', messagesChannelsRouter)
