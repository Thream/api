import { Router } from 'express'

import { discordRouter } from './discord'
import { githubRouter } from './github'
import { googleRouter } from './google'

const OAuth2Router = Router()

OAuth2Router.use('/', discordRouter)
OAuth2Router.use('/', githubRouter)
OAuth2Router.use('/', googleRouter)

export { OAuth2Router }
