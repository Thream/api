import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../../../tools/middlewares/authenticateUser'
import Invitation from '../../../../models/Invitation'
import Member from '../../../../models/Member'
import { BadRequestError } from '../../../../tools/errors/BadRequestError'
import { ForbiddenError } from '../../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../../tools/errors/NotFoundError'
import { emitToMembers } from '../../../../tools/socket/emitEvents'
import Channel from '../../../../models/Channel'

export const errorsMessages = {
  invitationExpired: 'The invitation expired',
  alreadyInGuild: 'You are already in the guild'
}

export const joinInvitationsRouter = Router()

joinInvitationsRouter.get(
  '/invitations/join/:value',
  authenticateUser,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const { value } = req.params as { value: string }
    const invitation = await Invitation.findOne({ where: { value } })
    if (invitation == null) {
      throw new NotFoundError()
    }
    const isValidInvitation =
      invitation.expiresIn === 0 || invitation.expiresIn > Date.now()
    if (!isValidInvitation) {
      throw new BadRequestError(errorsMessages.invitationExpired)
    }
    const member = await Member.findOne({
      where: { userId: user.id, guildId: invitation.guildId }
    })
    if (member != null) {
      throw new BadRequestError(errorsMessages.alreadyInGuild)
    }
    const defaultChannel = await Channel.findOne({
      where: { guildId: invitation.guildId, isDefault: true }
    })
    if (defaultChannel == null) {
      throw new BadRequestError('The guild should have a default channel.')
    }
    const createdMember = await Member.create({
      userId: user.id,
      guildId: invitation.guildId,
      isOwner: false,
      lastVisitedChannelId: defaultChannel.id
    })
    await emitToMembers({
      event: 'members',
      guildId: invitation.guildId,
      payload: { action: 'create', item: createdMember }
    })
    return res.status(201).json({ member: createdMember })
  }
)
