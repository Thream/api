import { Router } from 'express'

import { deleteByIdGuildsRouter } from './:guildId/delete'
import { getGuildsRouter } from './get'
import { getByIdGuildsRouter } from './:guildId/get'
import { getPublicDiscoverGuildsRouter } from './public/discover/get'
import { postGuildsRouter } from './post'
import { putByIdGuildsRouter } from './:guildId/put'

const guildsRouter = Router()

guildsRouter.use('/', postGuildsRouter)
guildsRouter.use('/', getGuildsRouter)
guildsRouter.use('/', getByIdGuildsRouter)
guildsRouter.use('/', getPublicDiscoverGuildsRouter)
guildsRouter.use('/', deleteByIdGuildsRouter)
guildsRouter.use('/', putByIdGuildsRouter)

export { guildsRouter }
