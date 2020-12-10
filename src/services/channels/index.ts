import { Router } from 'express'

import { deleteByIdChannelsRouter } from './:channelId/delete'
import { getChannelsRouter } from './get'
import { postChannelsRouter } from './post'
import { putByIdChannelsRouter } from './:channelId/put'

const channelsRouter = Router()

channelsRouter.use('/', postChannelsRouter)
channelsRouter.use('/', deleteByIdChannelsRouter)
channelsRouter.use('/', getChannelsRouter)
channelsRouter.use('/', putByIdChannelsRouter)

export { channelsRouter }
