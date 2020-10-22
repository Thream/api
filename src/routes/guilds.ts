import { Router } from 'express'

import { deleteByIdGuildsRouter } from '../controllers/Guilds/deleteById'
import { getGuildsRouter } from '../controllers/Guilds/get'
import { getByIdGuildsRouter } from '../controllers/Guilds/getById'
import { getPublicDiscoverGuildsRouter } from '../controllers/Guilds/getPublicDiscover'
import { postGuildsRouter } from '../controllers/Guilds/post'
import { putByIdGuildsRouter } from '../controllers/Guilds/putById'

const guildsRouter = Router()

guildsRouter.use('/', postGuildsRouter)
guildsRouter.use('/', getGuildsRouter)
guildsRouter.use('/', getByIdGuildsRouter)
guildsRouter.use('/', getPublicDiscoverGuildsRouter)
guildsRouter.use('/', deleteByIdGuildsRouter)
guildsRouter.use('/', putByIdGuildsRouter)

export { guildsRouter }
