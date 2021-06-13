import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../../tools/middlewares/authenticateUser'
import Channel from '../../../models/Channel'
import Member from '../../../models/Member'
import Message from '../../../models/Message'
import { messagesFilePath } from '../../../tools/configurations/constants'
import { BadRequestError } from '../../../tools/errors/BadRequestError'
import { ForbiddenError } from '../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../tools/errors/NotFoundError'
import { deleteFile } from '../../../tools/utils/deleteFiles'
import { emitToMembers } from '../../../tools/socket/emitEvents'

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
      await deleteFile({
        basePath: messagesFilePath,
        valueSavedInDatabase: message.value
      })
    }
    await message.destroy()
    await emitToMembers({
      event: 'messages',
      guildId: channel.guildId,
      payload: { action: 'delete', item: message }
    })
    return res.status(200).json({ deletedMessageId })
  }
)
