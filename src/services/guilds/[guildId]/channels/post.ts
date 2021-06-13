import { Request, Response, Router } from 'express'
import { body } from 'express-validator'

import { authenticateUser } from '../../../../tools/middlewares/authenticateUser'
import { validateRequest } from '../../../../tools/middlewares/validateRequest'
import Channel from '../../../../models/Channel'
import Member from '../../../../models/Member'
import { commonErrorsMessages } from '../../../../tools/configurations/constants'
import { ForbiddenError } from '../../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../../tools/errors/NotFoundError'
import { emitToMembers } from '../../../../tools/socket/emitEvents'

export const errorsMessages = {
  name: {
    isRequired: 'Name is required'
  }
}

export const postChannelsRouter = Router()

postChannelsRouter.post(
  '/guilds/:guildId/channels',
  authenticateUser,
  [
    body('name')
      .notEmpty()
      .withMessage(errorsMessages.name.isRequired)
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
      )
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const { name, description = '' } = req.body as {
      name: string
      description?: string
    }
    const { guildId } = req.params as { guildId: string }
    const member = await Member.findOne({
      where: { userId: user.id, guildId, isOwner: true }
    })
    if (member == null) {
      throw new NotFoundError()
    }
    const channel = await Channel.create({
      name,
      description,
      guildId: member.guildId
    })
    await emitToMembers({
      event: 'channels',
      guildId: member.guildId,
      payload: { action: 'create', item: channel }
    })
    return res.status(201).json({ channel })
  }
)
