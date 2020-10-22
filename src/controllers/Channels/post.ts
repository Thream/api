import { Request, Response, Router } from 'express'
import { body } from 'express-validator'

import { authenticateUser } from '../../middlewares/authenticateUser'
import { validateRequest } from '../../middlewares/validateRequest'
import Channel from '../../models/Channel'
import Member from '../../models/Member'
import { commonErrorsMessages } from '../../utils/config/constants'
import { socket } from '../../utils/config/socket'
import { ForbiddenError } from '../../utils/errors/ForbiddenError'
import { NotFoundError } from '../../utils/errors/NotFoundError'

export const errorsMessages = {
  name: {
    mustBeSlug: 'Name must be a slug',
    isRequired: 'Name is required'
  }
}

const postChannelsRouter = Router()

postChannelsRouter.post(
  '/guilds/:guildId',
  authenticateUser,
  [
    body('name')
      .notEmpty()
      .withMessage(errorsMessages.name.isRequired)
      .trim()
      .escape()
      .isLength({ max: 30, min: 3 })
      .withMessage(
        commonErrorsMessages.charactersLength('name', { max: 30, min: 3 })
      )
      .isSlug()
      .withMessage(errorsMessages.name.mustBeSlug),
    body('description')
      .optional({ nullable: true })
      .trim()
      .escape()
      .isLength({ max: 160 })
      .withMessage(
        commonErrorsMessages.charactersLength('description', { max: 160 })
      )
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const { name, description } = req.body as {
      name: string
      description?: string
    }
    const { guildId } = req.params as { guildId: string }
    const member = await Member.findOne({
      where: { userId: user.id, guildId, isOwner: true }
    })
    if (member == null) {
      throw new NotFoundError()
    }

    const channel = await Channel.create({
      name,
      description: description ?? '',
      guildId: member.guildId
    })

    socket.io?.emit('channels', { action: 'create', channel })
    return res.status(201).json({ channel })
  }
)

export { postChannelsRouter }
