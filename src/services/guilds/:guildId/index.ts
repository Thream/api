import { Router } from 'express'

import { deleteByIdGuildsRouter } from './delete'
import { getByIdGuildsRouter } from './get'
import { putByIdGuildsRouter } from './put'
import { guildsChannelsRouter } from './channels'

export const guildsGetByIdRouter = Router()

guildsGetByIdRouter.use('/', getByIdGuildsRouter)
guildsGetByIdRouter.use('/', deleteByIdGuildsRouter)
guildsGetByIdRouter.use('/', putByIdGuildsRouter)
guildsGetByIdRouter.use('/', guildsChannelsRouter)
