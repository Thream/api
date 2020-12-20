import { Router } from 'express'

import { deleteByIdInvitationsRouter } from './delete'

export const invitationsGetByIdRouter = Router()

invitationsGetByIdRouter.use('/', deleteByIdInvitationsRouter)
