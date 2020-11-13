import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../middlewares/authenticateUser'
import Guild from '../../models/Guild'
import Member from '../../models/Member'
import { emitToMembers } from '../../utils/config/socket'
import { ForbiddenError } from '../../utils/errors/ForbiddenError'
import { NotFoundError } from '../../utils/errors/NotFoundError'

const deleteByIdGuildsRouter = Router()

deleteByIdGuildsRouter.delete(
  '/:guildId',
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

    emitToMembers({
      event: 'guilds',
      guildId: member.guildId,
      payload: { action: 'delete', deletedGuildId }
    })
    return res.status(200).json({ deletedGuildId })
  }
)

export { deleteByIdGuildsRouter }
