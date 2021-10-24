import { Router } from 'express'

import { postInvitationsRouter } from './post'
import { getInvitationsRouter } from './get'

export const guildsInvitationsRouter = Router()

guildsInvitationsRouter.use('/', postInvitationsRouter)
guildsInvitationsRouter.use('/', getInvitationsRouter)
