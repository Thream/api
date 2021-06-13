import { Request, Response, Router } from 'express'
import Sequelize from 'sequelize'

import { authenticateUser } from '../../../../tools/middlewares/authenticateUser'
import Guild from '../../../../models/Guild'
import Invitation from '../../../../models/Invitation'
import { ObjectAny } from '../../../../typings/utils'
import { paginateModel } from '../../../../tools/database/paginateModel'

export const getPublicDiscoverGuildsRouter = Router()

getPublicDiscoverGuildsRouter.get(
  '/guilds/public/discover',
  authenticateUser,
  async (req: Request, res: Response) => {
    const { itemsPerPage, page, search } = req.query as {
      itemsPerPage: string
      page: string
      search?: string
    }
    const searchLowerCase = search?.toLowerCase()
    const result = await paginateModel({
      Model: Guild,
      queryOptions: { itemsPerPage, page },
      findOptions: {
        order: [['createdAt', 'DESC']],
        include: [Invitation],
        where: {
          isPublic: true,
          ...(searchLowerCase != null && {
            [Sequelize.Op.or]: [
              {
                name: Sequelize.where(
                  Sequelize.fn('LOWER', Sequelize.col('name')),
                  'LIKE',
                  `%${searchLowerCase}%`
                )
              }
            ]
          })
        }
      }
    })
    return res.status(200).json({
      hasMore: result.hasMore,
      totalItems: result.totalItems,
      itemsPerPage: result.itemsPerPage,
      page: result.page,
      rows: result.rows.map((row) => {
        const publicInvitation = row.invitations.find(
          (invitation) => invitation.isPublic
        )
        const attributes = row.toJSON() as ObjectAny
        delete attributes.invitations
        return {
          ...attributes,
          publicInvitation: publicInvitation?.value
        }
      })
    })
  }
)
