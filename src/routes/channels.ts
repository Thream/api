import { Router } from 'express'

import { deleteByIdChannelsRouter } from '../controllers/Channels/deleteById'
import { getChannelsRouter } from '../controllers/Channels/get'
import { postChannelsRouter } from '../controllers/Channels/post'
import { putByIdChannelsRouter } from '../controllers/Channels/putById'

const channelsRouter = Router()

channelsRouter.use('/', postChannelsRouter)
channelsRouter.use('/', deleteByIdChannelsRouter)
channelsRouter.use('/', getChannelsRouter)
channelsRouter.use('/', putByIdChannelsRouter)

export { channelsRouter }
