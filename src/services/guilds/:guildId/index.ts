import { Router } from 'express'

import { deleteByIdGuildsRouter } from './delete'
import { getByIdGuildsRouter } from './get'
import { putByIdGuildsRouter } from './put'

import { guildsChannelsRouter } from './channels'
import { guildsInvitationsRouter } from './invitations'
import { guildsMembersRouter } from './members'

export const guildsGetByIdRouter = Router()

guildsGetByIdRouter.use('/', getByIdGuildsRouter)
guildsGetByIdRouter.use('/', deleteByIdGuildsRouter)
guildsGetByIdRouter.use('/', putByIdGuildsRouter)

guildsGetByIdRouter.use('/', guildsChannelsRouter)
guildsGetByIdRouter.use('/', guildsInvitationsRouter)
guildsGetByIdRouter.use('/', guildsMembersRouter)
