import express, { Router } from 'express'
import path from 'path'
import swaggerUi from 'swagger-ui-express'

import { swaggerSpec } from '../utils/config/swaggerSpec'
import { channelsRouter } from './channels'
import { guildsRouter } from './guilds'
import { usersRouter } from './users'

const router = Router()

router.use(express.static(path.join(__dirname, '..', '..', 'public')))
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
router.use('/users', usersRouter)
router.use('/guilds', guildsRouter)
router.use('/channels', channelsRouter)

export { router }
