import express, { Router } from 'express'
import path from 'path'
import swaggerUi from 'swagger-ui-express'

import { swaggerSpec } from '../utils/config/swaggerSpec'
import { channelsRouter } from './channels'
import { guildsRouter } from './guilds'
import { usersRouter } from './users'

export const router = Router()

router.use(express.static(path.join(__dirname, '..', '..', 'public')))
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
router.use('/', usersRouter)
router.use('/', guildsRouter)
router.use('/', channelsRouter)
