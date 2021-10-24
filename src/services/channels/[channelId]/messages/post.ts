import { Request, Response, Router } from 'express'
import { body } from 'express-validator'
import fileUpload from 'express-fileupload'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

import { authenticateUser } from '../../../../tools/middlewares/authenticateUser'
import { validateRequest } from '../../../../tools/middlewares/validateRequest'
import Channel from '../../../../models/Channel'
import Member from '../../../../models/Member'
import Message, { MessageType, messageTypes } from '../../../../models/Message'
import {
  commonErrorsMessages,
  fileUploadOptions,
  messagesFilePath,
  tempPath
} from '../../../../tools/configurations/constants'
import { ForbiddenError } from '../../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../../tools/errors/NotFoundError'
import { onlyPossibleValuesValidation } from '../../../../tools/validations/onlyPossibleValuesValidation'
import { deleteAllFilesInDirectory } from '../../../../tools/utils/deleteFiles'
import { PayloadTooLargeError } from '../../../../tools/errors/PayloadTooLargeError'
import { BadRequestError } from '../../../../tools/errors/BadRequestError'
import { emitToMembers } from '../../../../tools/socket/emitEvents'

export const errorsMessages = {
  type: {
    shouldNotBeEmpty: 'Type should not be empty'
  }
}

export const postMessagesRouter = Router()

postMessagesRouter.post(
  '/channels/:channelId/messages',
  authenticateUser,
  fileUpload(fileUploadOptions),
  [
    body('value')
      .optional({ nullable: true })
      .trim()
      .escape()
      .isLength({ min: 1, max: 50_000 })
      .withMessage(
        commonErrorsMessages.charactersLength('value', { min: 1, max: 50_000 })
      ),
    body('type')
      .notEmpty()
      .withMessage(errorsMessages.type.shouldNotBeEmpty)
      .trim()
      .isString()
      .custom(async (type: MessageType) => {
        return await onlyPossibleValuesValidation(messageTypes, 'type', type)
      })
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const { value, type } = req.body as {
      value?: string
      type: MessageType
    }
    const file = req.files?.file
    const { channelId } = req.params as { channelId: string }
    const channel = await Channel.findOne({
      where: { id: channelId, type: 'text' }
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
    if (
      (type === 'file' && file == null) ||
      (type === 'text' && value == null)
    ) {
      throw new BadRequestError("You can't send an empty message")
    }
    let filename: string | null = null
    let mimetype = 'text/plain'
    if (
      value == null &&
      type === 'file' &&
      file != null &&
      !Array.isArray(file)
    ) {
      if (file.truncated) {
        await deleteAllFilesInDirectory(tempPath)
        throw new PayloadTooLargeError(
          commonErrorsMessages.tooLargeFile('file')
        )
      }
      mimetype = file.mimetype
      const splitedMimetype = mimetype.split('/')
      const fileExtension = splitedMimetype[1]
      filename = `${uuidv4()}.${fileExtension}`
      await file.mv(path.join(messagesFilePath.filePath, filename))
      await deleteAllFilesInDirectory(tempPath)
    }
    const messageCreated = await Message.create({
      value: filename != null ? `${messagesFilePath.name}/${filename}` : value,
      type,
      mimetype,
      memberId: member.id,
      channelId: channel.id
    })
    const message = { ...messageCreated.toJSON(), user: req.user.current }
    await emitToMembers({
      event: 'messages',
      guildId: member.guildId,
      payload: { action: 'create', item: message }
    })
    return res.status(201).json({ message })
  }
)
