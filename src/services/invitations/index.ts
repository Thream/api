import { Router } from 'express'

import { invitationsGetByIdRouter } from './[invitationId]'
import { invitationsJoinByValueRouter } from './join/[value]'

export const invitationsRouter = Router()

invitationsRouter.use('/', invitationsGetByIdRouter)
invitationsRouter.use('/', invitationsJoinByValueRouter)
