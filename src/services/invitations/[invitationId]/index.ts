import { Router } from 'express'

import { deleteByIdInvitationsRouter } from './delete'
import { putInvitationsRouter } from './put'

export const invitationsGetByIdRouter = Router()

invitationsGetByIdRouter.use('/', deleteByIdInvitationsRouter)
invitationsGetByIdRouter.use('/', putInvitationsRouter)
