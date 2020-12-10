import { Router } from 'express'

import { deleteByIdGuildsRouter } from '../controllers/guilds/:guildId/delete'
import { getGuildsRouter } from '../controllers/guilds/get'
import { getByIdGuildsRouter } from '../controllers/guilds/:guildId/get'
import { getPublicDiscoverGuildsRouter } from '../controllers/guilds/public/discover/get'
import { postGuildsRouter } from '../controllers/guilds/post'
import { putByIdGuildsRouter } from '../controllers/guilds/:guildId/put'

const guildsRouter = Router()

guildsRouter.use('/', postGuildsRouter)
guildsRouter.use('/', getGuildsRouter)
guildsRouter.use('/', getByIdGuildsRouter)
guildsRouter.use('/', getPublicDiscoverGuildsRouter)
guildsRouter.use('/', deleteByIdGuildsRouter)
guildsRouter.use('/', putByIdGuildsRouter)

export { guildsRouter }
