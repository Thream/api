import { Request, Response, Router } from 'express'
import * as fsWithCallbacks from 'fs'
import path from 'path'

import { authenticateUser } from '../../../middlewares/authenticateUser'
import Channel from '../../../models/Channel'
import Member from '../../../models/Member'
import Message from '../../../models/Message'
import { uploadsPath } from '../../../utils/config/constants'
import { emitToMembers } from '../../../utils/config/socket'
import { BadRequestError } from '../../../utils/errors/BadRequestError'
import { ForbiddenError } from '../../../utils/errors/ForbiddenError'
import { NotFoundError } from '../../../utils/errors/NotFoundError'

const fs = fsWithCallbacks.promises

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
    if (!member.isOwner && member.id !== message.memberId) {
      throw new BadRequestError(
        'You can only delete your messages except if you are owner of the guild'
      )
    }
    const deletedMessageId = message.id
    if (message.type === 'file') {
      const filePath = message.value.split('/')
      const filename = filePath[filePath.length - 1]
      await fs.unlink(path.join(uploadsPath, filename))
    }
    await message.destroy()
    await emitToMembers({
      event: 'messages',
      guildId: channel.guildId,
      payload: { action: 'delete', deletedMessageId }
    })
    return res.status(200).json({ deletedMessageId })
  }
)
