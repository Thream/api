import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../../../middlewares/authenticateUser'
import Invitation from '../../../../models/Invitation'
import Member from '../../../../models/Member'
import { BadRequestError } from '../../../../utils/errors/BadRequestError'
import { ForbiddenError } from '../../../../utils/errors/ForbiddenError'
import { NotFoundError } from '../../../../utils/errors/NotFoundError'

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
    await Member.create({
      userId: user.id,
      guildId: invitation.guildId,
      isOwner: false
    })
    return res.status(200).json({})
  }
)
