import { Router } from 'express'

import { deleteByIdGuildsRouter } from '../controllers/guilds/deleteById'
import { getGuildsRouter } from '../controllers/guilds/get'
import { getByIdGuildsRouter } from '../controllers/guilds/getById'
import { getPublicDiscoverGuildsRouter } from '../controllers/guilds/public/getDiscover'
import { postGuildsRouter } from '../controllers/guilds/post'
import { putByIdGuildsRouter } from '../controllers/guilds/putById'

const guildsRouter = Router()

guildsRouter.use('/', postGuildsRouter)
guildsRouter.use('/', getGuildsRouter)
guildsRouter.use('/', getByIdGuildsRouter)
guildsRouter.use('/', getPublicDiscoverGuildsRouter)
guildsRouter.use('/', deleteByIdGuildsRouter)
guildsRouter.use('/', putByIdGuildsRouter)

export { guildsRouter }
