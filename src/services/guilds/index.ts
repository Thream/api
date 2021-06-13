import { Router } from 'express'

import { getGuildsRouter } from './get'
import { getPublicDiscoverGuildsRouter } from './public/discover/get'
import { postGuildsRouter } from './post'
import { guildsGetByIdRouter } from './[guildId]'

export const guildsRouter = Router()

guildsRouter.use('/', postGuildsRouter)
guildsRouter.use('/', getGuildsRouter)
guildsRouter.use('/', getPublicDiscoverGuildsRouter)
guildsRouter.use('/', guildsGetByIdRouter)
