import { Request, Response, Router } from 'express'
import { body } from 'express-validator'

import { authenticateUser } from '../../middlewares/authenticateUser'
import { validateRequest } from '../../middlewares/validateRequest'
import Channel from '../../models/Channel'
import Member from '../../models/Member'
import { commonErrorsMessages } from '../../utils/config/constants'
import { emitToMembers } from '../../utils/config/socket'
import { ForbiddenError } from '../../utils/errors/ForbiddenError'
import { NotFoundError } from '../../utils/errors/NotFoundError'

export const errorsMessages = {
  name: {
    mustBeSlug: 'Name must be a slug'
  }
}

const putByIdChannelsRouter = Router()

putByIdChannelsRouter.put(
  '/:channelId',
  authenticateUser,
  [
    body('name')
      .optional({ nullable: true })
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
      ),
    body('isDefault')
      .optional({ nullable: true })
      .isBoolean()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const { channelId } = req.params as { channelId: string }
    const { name, description, isDefault } = req.body as {
      name?: string
      description?: string
      isDefault?: boolean
    }
    const channel = await Channel.findOne({
      where: { id: channelId }
    })
    if (channel == null) {
      throw new NotFoundError()
    }

    const member = await Member.findOne({
      where: { userId: user.id, guildId: channel.guildId, isOwner: true }
    })
    if (member == null) {
      throw new NotFoundError()
    }

    channel.name = name ?? channel.name
    channel.description = description ?? channel.description

    if (isDefault != null) {
      const defaultChannel = await Channel.findOne({
        where: { isDefault: true, guildId: member.guildId }
      })
      if (isDefault && defaultChannel != null) {
        defaultChannel.isDefault = false
        channel.isDefault = true
        await defaultChannel.save()
      }
    }

    await channel.save()

    emitToMembers({
      event: 'channels',
      guildId: channel.guildId,
      payload: { action: 'update', channel }
    })
    return res.status(200).json({ channel })
  }
)

export { putByIdChannelsRouter }
