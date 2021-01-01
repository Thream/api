import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../../../tools/middlewares/authenticateUser'
import Invitation from '../../../../models/Invitation'
import Member from '../../../../models/Member'
import { paginateModel } from '../../../../tools/database/paginateModel'
import { ForbiddenError } from '../../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../../tools/errors/NotFoundError'

export const getInvitationsRouter = Router()

getInvitationsRouter.get(
  '/guilds/:guildId/invitations',
  authenticateUser,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const { itemsPerPage, page } = req.query as {
      itemsPerPage: string
      page: string
    }
    const user = req.user.current
    const { guildId } = req.params as { guildId: string }
    const member = await Member.findOne({
      where: { userId: user.id, guildId, isOwner: true }
    })
    if (member == null) {
      throw new NotFoundError()
    }
    const invitations = await paginateModel({
      Model: Invitation,
      queryOptions: { itemsPerPage, page },
      findOptions: {
        order: [['createdAt', 'DESC']],
        where: {
          guildId: member.guildId
        }
      }
    })
    return res.status(200).json(invitations)
  }
)
