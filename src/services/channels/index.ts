import { Router } from 'express'

import { deleteByIdChannelsRouter } from './:channelId/delete'
import { putByIdChannelsRouter } from './:channelId/put'

export const channelsRouter = Router()

channelsRouter.use('/', deleteByIdChannelsRouter)
channelsRouter.use('/', putByIdChannelsRouter)
