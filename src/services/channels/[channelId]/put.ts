import { Request, Response, Router } from 'express'
import { body } from 'express-validator'

import { authenticateUser } from '../../../tools/middlewares/authenticateUser'
import { validateRequest } from '../../../tools/middlewares/validateRequest'
import Channel from '../../../models/Channel'
import Member from '../../../models/Member'
import { commonErrorsMessages } from '../../../tools/configurations/constants'
import { ForbiddenError } from '../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../tools/errors/NotFoundError'
import { emitToMembers } from '../../../tools/socket/emitEvents'

export const putByIdChannelsRouter = Router()

putByIdChannelsRouter.put(
  '/channels/:channelId',
  authenticateUser,
  [
    body('name')
      .optional({ nullable: true })
      .isString()
      .trim()
      .escape()
      .isLength({ max: 30, min: 3 })
      .withMessage(
        commonErrorsMessages.charactersLength('name', { max: 30, min: 3 })
      ),
    body('description')
      .optional({ nullable: true })
      .trim()
      .escape()
      .isLength({ max: 160 })
      .withMessage(
        commonErrorsMessages.charactersLength('description', { max: 160 })
      ),
    body('isDefault').optional({ nullable: true }).isBoolean()
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
        const defaultChannelMembers = await Member.findAll({
          where: {
            guildId: member.guildId,
            lastVisitedChannelId: defaultChannel.id
          }
        })
        for (const defaultChannelMember of defaultChannelMembers) {
          defaultChannelMember.lastVisitedChannelId = channel.id
          await defaultChannelMember.save()
        }
      }
    }
    await channel.save()
    await emitToMembers({
      event: 'channels',
      guildId: channel.guildId,
      payload: { action: 'update', item: channel }
    })
    return res.status(200).json({ channel })
  }
)
