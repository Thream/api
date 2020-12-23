import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../../middlewares/authenticateUser'
import Channel from '../../../models/Channel'
import Member from '../../../models/Member'
import Message from '../../../models/Message'
import { emitToMembers } from '../../../utils/config/socket'
import { ForbiddenError } from '../../../utils/errors/ForbiddenError'
import { NotFoundError } from '../../../utils/errors/NotFoundError'

export const deleteByIdMessagesRouter = Router()

deleteByIdMessagesRouter.delete(
  '/messages/:messageId',
  authenticateUser,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const { messageId } = req.params as { messageId: string }
    const message = await Message.findOne({ where: { id: messageId } })
    if (message == null) {
      throw new NotFoundError()
    }
    const channel = await Channel.findOne({
      where: { id: message.channelId }
    })
    if (channel == null) {
      throw new NotFoundError()
    }
    const member = await Member.findOne({
      where: { userId: user.id, guildId: channel.guildId }
    })
    if (member == null) {
      throw new NotFoundError()
    }
    const deletedMessageId = message.id
    await message.destroy()
    emitToMembers({
      event: 'messages',
      guildId: channel.guildId,
      payload: { action: 'delete', deletedMessageId }
    })
    return res.status(200).json({ deletedMessageId })
  }
)
