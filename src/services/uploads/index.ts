import { Router, static as staticExpress } from 'express'

import {
  guildsIconPath,
  messagesFilePath,
  usersLogoPath
} from '../../tools/config/constants'

export const uploadsRouter = Router()

uploadsRouter.use(guildsIconPath.name, staticExpress(guildsIconPath.filePath))
uploadsRouter.use(usersLogoPath.name, staticExpress(usersLogoPath.filePath))
uploadsRouter.use(
  messagesFilePath.name,
  staticExpress(messagesFilePath.filePath)
)
