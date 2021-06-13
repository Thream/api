import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../../../tools/middlewares/authenticateUser'
import Channel from '../../../../models/Channel'
import Member from '../../../../models/Member'
import Message from '../../../../models/Message'
import { paginateModel } from '../../../../tools/database/paginateModel'
import { ForbiddenError } from '../../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../../tools/errors/NotFoundError'
import User from '../../../../models/User'

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
    member.lastVisitedChannelId = channel.id
    await member.save()
    const result = await paginateModel({
      Model: Message,
      queryOptions: { itemsPerPage, page },
      findOptions: {
        order: [['createdAt', 'DESC']],
        include: [{ model: Member, include: [User] }],
        where: {
          channelId: channel.id
        }
      }
    })
    return res.status(200).json({
      hasMore: result.hasMore,
      totalItems: result.totalItems,
      itemsPerPage: result.itemsPerPage,
      page: result.page,
      rows: result.rows.reverse().map((row: any) => {
        return { ...row.toJSON(), user: row.member.user.toJSON() }
      })
    })
  }
)
