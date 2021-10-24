import { Router } from 'express'

import { getUsersRouter } from './get'

export const usersGetByIdRouter = Router()

usersGetByIdRouter.use('/', getUsersRouter)
