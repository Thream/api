import { Router } from 'express'

import { deleteOAuthStrategy } from './delete'
import { discordRouter } from './discord'
import { githubRouter } from './github'
import { googleRouter } from './google'

const OAuth2Router = Router()

OAuth2Router.use('/', discordRouter)
OAuth2Router.use('/', githubRouter)
OAuth2Router.use('/', googleRouter)
OAuth2Router.use('/', deleteOAuthStrategy)

export { OAuth2Router }
