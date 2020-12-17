import { Router } from 'express'

import { postInvitationsRouter } from './post'

export const guildsInvitationsRouter = Router()

guildsInvitationsRouter.use('/', postInvitationsRouter)
