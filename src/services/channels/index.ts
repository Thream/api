import { Router } from 'express'

import { deleteByIdChannelsRouter } from './:channelId/delete'
import { putByIdChannelsRouter } from './:channelId/put'

const channelsRouter = Router()

channelsRouter.use('/', deleteByIdChannelsRouter)
channelsRouter.use('/', putByIdChannelsRouter)

export { channelsRouter }
