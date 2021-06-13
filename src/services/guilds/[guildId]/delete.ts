import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../../tools/middlewares/authenticateUser'
import Guild from '../../../models/Guild'
import Member from '../../../models/Member'
import { ForbiddenError } from '../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../tools/errors/NotFoundError'
import { guildsIconPath } from '../../../tools/configurations/constants'
import { deleteFile, deleteMessages } from '../../../tools/utils/deleteFiles'
import Channel from '../../../models/Channel'
import Message from '../../../models/Message'
import { emitToMembers } from '../../../tools/socket/emitEvents'

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
    await emitToMembers({
      event: 'guilds',
      guildId: member.guildId,
      payload: { action: 'delete', item: member.guild }
    })
    await deleteFile({
      basePath: guildsIconPath,
      valueSavedInDatabase: member.guild.icon
    })
    const members = await Member.findAll({ where: { guildId: deletedGuildId } })
    for (const member of members) {
      await member.destroy()
    }
    const channels = await Channel.findAll({
      where: { guildId },
      include: [Message]
    })
    for (const channel of channels) {
      await deleteMessages(channel.messages)
      await channel.destroy()
    }
    await member.guild.destroy()
    return res.status(200).json({ deletedGuildId })
  }
)
