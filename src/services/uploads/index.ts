import {
  Request,
  Response,
  NextFunction,
  Router,
  static as staticExpress
} from 'express'

import {
  guildsIconPath,
  messagesFilePath,
  usersLogoPath
} from '../../tools/configurations/constants'
import { ForbiddenError } from '../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../tools/errors/NotFoundError'
import { authenticateUser } from '../../tools/middlewares/authenticateUser'
import Channel from '../../models/Channel'
import Member from '../../models/Member'
import Message from '../../models/Message'

export const uploadsRouter = Router()

uploadsRouter.use(guildsIconPath.name, staticExpress(guildsIconPath.filePath))
uploadsRouter.use(usersLogoPath.name, staticExpress(usersLogoPath.filePath))
uploadsRouter.use(
  messagesFilePath.name,
  authenticateUser,
  async (req: Request, _res: Response, next: NextFunction) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const messageValue = messagesFilePath.name + req.path
    const message = await Message.findOne({
      where: { type: 'file', value: messageValue },
      include: [Channel]
    })
    if (message == null) {
      throw new NotFoundError()
    }
    const member = await Member.findOne({
      where: { userId: user.id, guildId: message.channel.guildId }
    })
    if (member == null) {
      throw new NotFoundError()
    }
    return next()
  },
  staticExpress(messagesFilePath.filePath)
)
