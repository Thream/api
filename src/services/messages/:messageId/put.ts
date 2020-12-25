import { Request, Response, Router } from 'express'
import { body } from 'express-validator'

import { authenticateUser } from '../../../middlewares/authenticateUser'
import { validateRequest } from '../../../middlewares/validateRequest'
import Channel from '../../../models/Channel'
import Member from '../../../models/Member'
import Message from '../../../models/Message'
import { commonErrorsMessages } from '../../../utils/config/constants'
import { emitToMembers } from '../../../utils/config/socket'
import { BadRequestError } from '../../../utils/errors/BadRequestError'
import { ForbiddenError } from '../../../utils/errors/ForbiddenError'
import { NotFoundError } from '../../../utils/errors/NotFoundError'

export const putMessagesRouter = Router()

putMessagesRouter.put(
  '/messages/:messageId',
  authenticateUser,
  [
    body('value')
      .trim()
      .escape()
      .isLength({ min: 1, max: 10_000 })
      .withMessage(
        commonErrorsMessages.charactersLength('value', { min: 1, max: 10_000 })
      )
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const { value } = req.body as { value: string }
    const { messageId } = req.params as { messageId: string }
    const messageToEdit = await Message.findOne({ where: { id: messageId } })
    if (messageToEdit == null) {
      throw new NotFoundError()
    }
    const channel = await Channel.findOne({
      where: { id: messageToEdit.channelId }
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
    if (member.id !== messageToEdit.memberId) {
      throw new BadRequestError('You can only update your messages')
    }
    messageToEdit.value = value ?? messageToEdit.value
    await messageToEdit.save()
    const message = { ...messageToEdit.toJSON(), user: req.user.current }
    emitToMembers({
      event: 'messages',
      guildId: channel.guildId,
      payload: { action: 'update', message }
    })
    return res.status(200).json({ message })
  }
)
