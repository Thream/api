import { Router } from 'express'

import { deleteByIdMembersRouter } from './delete'

export const membersRouter = Router()

membersRouter.use('/', deleteByIdMembersRouter)
