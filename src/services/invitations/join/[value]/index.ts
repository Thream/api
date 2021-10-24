import { Router } from 'express'

import { joinInvitationsRouter } from './get'

export const invitationsJoinByValueRouter = Router()

invitationsJoinByValueRouter.use('/', joinInvitationsRouter)
