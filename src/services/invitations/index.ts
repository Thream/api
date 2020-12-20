import { Router } from 'express'

import { invitationsGetByIdRouter } from './:invitationId'

export const invitationsRouter = Router()

invitationsRouter.use('/', invitationsGetByIdRouter)
