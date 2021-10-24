import { Request, Response, Router } from 'express'

import Member from '../../models/Member'
import { ForbiddenError } from '../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../tools/errors/NotFoundError'
import { authenticateUser } from '../../tools/middlewares/authenticateUser'
import { emitToMembers } from '../../tools/socket/emitEvents'

export const deleteByIdMembersRouter = Router()

deleteByIdMembersRouter.delete(
  '/members',
  authenticateUser,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const member = await Member.findOne({ where: { userId: user.id, isOwner: false } })
    if (member == null) {
      throw new NotFoundError()
    }
    const deletedMemberId = member.id
    await member.destroy()
    await emitToMembers({
      event: 'members',
      guildId: member.guildId,
      payload: { action: 'delete', item: member }
    })
    return res.status(200).json({ deletedMemberId })
  }
)
