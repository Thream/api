import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../middlewares/authenticateUser'
import Guild from '../../models/Guild'
import Member from '../../models/Member'
import { paginateModel } from '../../utils/database/paginateModel'
import { ForbiddenError } from '../../utils/errors/ForbiddenError'

const getGuildsRouter = Router()

getGuildsRouter.get(
  '/',
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
    const { hasMore, totalItems, rows } = await paginateModel({
      Model: Member,
      queryOptions: { itemsPerPage, page },
      findOptions: {
        order: [['createdAt', 'DESC']],
        where: {
          userId: user.id
        },
        include: [Guild]
      }
    })
    return res.status(200).json({
      hasMore,
      totalItems,
      rows: rows.map(row => {
        return row.guild
      })
    })
  }
)

export { getGuildsRouter }
