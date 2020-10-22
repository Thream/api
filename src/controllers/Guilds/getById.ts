import { Request, Response, Router } from 'express'

import { authenticateUser } from '../../middlewares/authenticateUser'
import Guild from '../../models/Guild'
import Member from '../../models/Member'
import { ForbiddenError } from '../../utils/errors/ForbiddenError'
import { NotFoundError } from '../../utils/errors/NotFoundError'

const getByIdGuildsRouter = Router()

getByIdGuildsRouter.get(
  '/:guildId',
  authenticateUser,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const { guildId } = req.params as { guildId: string }
    const member = await Member.findOne({
      where: { userId: user.id, guildId },
      include: [Guild]
    })
    if (member == null) {
      throw new NotFoundError()
    }
    return res.status(200).json({ guild: member.guild })
  }
)

export { getByIdGuildsRouter }
