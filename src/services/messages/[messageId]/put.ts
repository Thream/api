import { Request, Response, Router } from 'express'
import { body } from 'express-validator'

import { authenticateUser } from '../../../tools/middlewares/authenticateUser'
import { validateRequest } from '../../../tools/middlewares/validateRequest'
import Channel from '../../../models/Channel'
import Member from '../../../models/Member'
import Message from '../../../models/Message'
import { commonErrorsMessages } from '../../../tools/configurations/constants'
import { BadRequestError } from '../../../tools/errors/BadRequestError'
import { ForbiddenError } from '../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../tools/errors/NotFoundError'
import { emitToMembers } from '../../../tools/socket/emitEvents'

export const putByIdMessagesRouter = Router()

putByIdMessagesRouter.put(
  '/messages/:messageId',
  authenticateUser,
  [
    body('value')
      .trim()
      .escape()
      .isLength({ min: 1, max: 50_000 })
      .withMessage(
        commonErrorsMessages.charactersLength('value', { min: 1, max: 50_000 })
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
    if (messageToEdit.type === 'file') {
      throw new BadRequestError(
        'You can\'t edit a message with the type "file"'
      )
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
    await emitToMembers({
      event: 'messages',
      guildId: channel.guildId,
      payload: { action: 'update', item: message }
    })
    return res.status(200).json({ message })
  }
)
