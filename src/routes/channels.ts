import { Router } from 'express'

import { deleteByIdChannelsRouter } from '../controllers/channels/:channelId/delete'
import { getChannelsRouter } from '../controllers/channels/get'
import { postChannelsRouter } from '../controllers/channels/post'
import { putByIdChannelsRouter } from '../controllers/channels/:channelId/put'

const channelsRouter = Router()

channelsRouter.use('/', postChannelsRouter)
channelsRouter.use('/', deleteByIdChannelsRouter)
channelsRouter.use('/', getChannelsRouter)
channelsRouter.use('/', putByIdChannelsRouter)

export { channelsRouter }
