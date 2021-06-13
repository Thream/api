import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../../tools/middlewares/authenticateUser'
import Channel from '../../../models/Channel'
import Member from '../../../models/Member'
import { BadRequestError } from '../../../tools/errors/BadRequestError'
import { ForbiddenError } from '../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../tools/errors/NotFoundError'
import { deleteMessages } from '../../../tools/utils/deleteFiles'
import Message from '../../../models/Message'
import { emitToMembers } from '../../../tools/socket/emitEvents'

export const errorsMessages = {
  channel: {
    shouldNotBeTheDefault: 'The channel to delete should not be the default'
  }
}

export const deleteByIdChannelsRouter = Router()

deleteByIdChannelsRouter.delete(
  '/channels/:channelId',
  authenticateUser,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const { channelId } = req.params as { channelId: string }
    const channel = await Channel.findOne({
      where: { id: channelId },
      include: [Message]
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
    if (channel.isDefault) {
      throw new BadRequestError(errorsMessages.channel.shouldNotBeTheDefault)
    }
    const deletedChannelId = channel.id
    await deleteMessages(channel.messages)
    await channel.destroy()
    await emitToMembers({
      event: 'channels',
      guildId: channel.guildId,
      payload: { action: 'delete', item: channel }
    })
    return res.status(200).json({ deletedChannelId })
  }
)
