import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../../../tools/middlewares/authenticateUser'
import Member from '../../../../models/Member'
import { paginateModel } from '../../../../tools/database/paginateModel'
import { ForbiddenError } from '../../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../../tools/errors/NotFoundError'

export const getMembersRouter = Router()

getMembersRouter.get(
  '/guilds/:guildId/members',
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
      where: { userId: user.id, guildId }
    })
    if (member == null) {
      throw new NotFoundError()
    }
    const result = await paginateModel({
      Model: Member,
      queryOptions: { itemsPerPage, page },
      findOptions: {
        order: [['createdAt', 'DESC']],
        where: {
          guildId: member.guildId
        }
      }
    })
    return res.status(200).json({
      hasMore: result.hasMore,
      totalItems: result.totalItems,
      itemsPerPage: result.itemsPerPage,
      page: result.page,
      rows: result.rows.map((row) => {
        return { ...row.toJSON(), user: user.toJSON() }
      })
    })
  }
)
