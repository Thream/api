import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../tools/middlewares/authenticateUser'
import Guild from '../../models/Guild'
import Member from '../../models/Member'
import { paginateModel } from '../../tools/database/paginateModel'
import { ForbiddenError } from '../../tools/errors/ForbiddenError'

export const getGuildsRouter = Router()

getGuildsRouter.get(
  '/guilds',
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
    const guilds = await paginateModel({
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
    return res.status(200).json(guilds)
  }
)
