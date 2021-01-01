import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../../../tools/middlewares/authenticateUser'
import Channel from '../../../../models/Channel'
import Member from '../../../../models/Member'
import Message from '../../../../models/Message'
import { paginateModel } from '../../../../tools/database/paginateModel'
import { ForbiddenError } from '../../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../../tools/errors/NotFoundError'

export const getMessagesRouter = Router()

getMessagesRouter.get(
  '/channels/:channelId/messages',
  authenticateUser,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const { itemsPerPage, page } = req.query as {
      itemsPerPage: string
      page: string
    }
    const { channelId } = req.params as { channelId: string }
    const user = req.user.current
    const channel = await Channel.findOne({ where: { id: channelId } })
    if (channel == null) {
      throw new NotFoundError()
    }
    const member = await Member.findOne({
      where: { userId: user.id, guildId: channel.guildId }
    })
    if (member == null) {
      throw new NotFoundError()
    }
    const { hasMore, totalItems, rows } = await paginateModel({
      Model: Message,
      queryOptions: { itemsPerPage, page },
      findOptions: {
        order: [['createdAt', 'ASC']],
        where: {
          channelId: channel.id
        }
      }
    })
    return res.status(200).json({
      hasMore,
      totalItems,
      rows: rows.map((row) => {
        return { ...row.toJSON(), user: user.toJSON() }
      })
    })
  }
)
