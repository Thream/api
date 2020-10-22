import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../middlewares/authenticateUser'
import Channel from '../../models/Channel'
import Member from '../../models/Member'
import { socket } from '../../utils/config/socket'
import { BadRequestError } from '../../utils/errors/BadRequestError'
import { ForbiddenError } from '../../utils/errors/ForbiddenError'
import { NotFoundError } from '../../utils/errors/NotFoundError'

export const errorsMessages = {
  channel: {
    shouldNotBeTheDefault: 'The channel to delete should not be the default'
  }
}

const deleteByIdChannelsRouter = Router()

deleteByIdChannelsRouter.delete(
  '/:channelId',
  authenticateUser,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const { channelId } = req.params as { channelId: string }
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

    if (channel.isDefault) {
      throw new BadRequestError(errorsMessages.channel.shouldNotBeTheDefault)
    }

    const deletedChannelId = channel.id
    await channel.destroy()
    socket.io?.emit('guilds', { action: 'delete', deletedChannelId })
    return res.status(200).json({ deletedChannelId })
  }
)

export { deleteByIdChannelsRouter }
