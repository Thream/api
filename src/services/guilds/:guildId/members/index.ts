import { Router } from 'express'

import { getMembersRouter } from './get'

export const guildsMembersRouter = Router()

guildsMembersRouter.use('/', getMembersRouter)
