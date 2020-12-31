import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../../tools/middlewares/authenticateUser'
import Guild from '../../../models/Guild'
import Member from '../../../models/Member'
import { emitToMembers } from '../../../tools/socket/socket'
import { ForbiddenError } from '../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../tools/errors/NotFoundError'

export const deleteByIdGuildsRouter = Router()

deleteByIdGuildsRouter.delete(
  '/guilds/:guildId',
  authenticateUser,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const { guildId } = req.params as { guildId: string }
    const member = await Member.findOne({
      where: { userId: user.id, guildId, isOwner: true },
      include: [Guild]
    })
    if (member == null) {
      throw new NotFoundError()
    }

    const deletedGuildId = member.guild.id
    await member.guild.destroy()

    await emitToMembers({
      event: 'guilds',
      guildId: member.guildId,
      payload: { action: 'delete', deletedGuildId }
    })
    return res.status(200).json({ deletedGuildId })
  }
)
