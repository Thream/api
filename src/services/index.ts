import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'

import { swaggerSpec } from '../tools/config/swaggerSpec'
import { channelsRouter } from './channels'
import { guildsRouter } from './guilds'
import { invitationsRouter } from './invitations'
import { membersRouter } from './members'
import { messagesRouter } from './messages'
import { uploadsRouter } from './uploads'
import { usersRouter } from './users'

export const router = Router()

router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
router.use(uploadsRouter)
router.use(usersRouter)
router.use(guildsRouter)
router.use(channelsRouter)
router.use(invitationsRouter)
router.use(messagesRouter)
router.use(membersRouter)
