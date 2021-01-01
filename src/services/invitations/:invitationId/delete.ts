import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../../tools/middlewares/authenticateUser'
import Guild from '../../../models/Guild'
import Invitation from '../../../models/Invitation'
import Member from '../../../models/Member'
import { BadRequestError } from '../../../tools/errors/BadRequestError'
import { ForbiddenError } from '../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../tools/errors/NotFoundError'

export const deleteByIdInvitationsRouter = Router()

deleteByIdInvitationsRouter.delete(
  '/invitations/:invitationId',
  authenticateUser,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const { invitationId } = req.params as { invitationId: string }
    const invitation = await Invitation.findOne({ where: { id: invitationId } })
    if (invitation == null) {
      throw new NotFoundError()
    }
    const member = await Member.findOne({
      where: { userId: user.id, guildId: invitation.guildId, isOwner: true },
      include: [Guild]
    })
    if (member == null) {
      throw new NotFoundError()
    }
    if (member.guild.isPublic && invitation.isPublic) {
      throw new BadRequestError("You can't delete the public invitation")
    }
    const deletedInvitationId = invitation.id
    await invitation.destroy()
    return res.status(200).json({ deletedInvitationId })
  }
)
