import { Request, Response, Router } from 'express'
import fileUpload from 'express-fileupload'
import { body } from 'express-validator'
import { v4 as uuidv4 } from 'uuid'

import { authenticateUser } from '../../middlewares/authenticateUser'
import { validateRequest } from '../../middlewares/validateRequest'
import Guild from '../../models/Guild'
import Invitation from '../../models/Invitation'
import Member from '../../models/Member'
import { ObjectAny } from '../../typings/utils'
import {
  commonErrorsMessages,
  guildsIconPath,
  imageFileUploadOptions
} from '../../utils/config/constants'
import { socket } from '../../utils/config/socket'
import { alreadyUsedValidation } from '../../utils/database/alreadyUsedValidation'
import { ForbiddenError } from '../../utils/errors/ForbiddenError'
import { NotFoundError } from '../../utils/errors/NotFoundError'
import { uploadImage } from '../../utils/uploadImage'

const putByIdGuildsRouter = Router()

putByIdGuildsRouter.put(
  '/:guildId',
  authenticateUser,
  fileUpload(imageFileUploadOptions),
  [
    body('name')
      .optional({ nullable: true })
      .trim()
      .escape()
      .isLength({ max: 30, min: 3 })
      .withMessage(
        commonErrorsMessages.charactersLength('name', { max: 30, min: 3 })
      )
      .custom(async (name: string) => {
        return await alreadyUsedValidation(Guild, 'name', name)
      }),
    body('description')
      .optional({ nullable: true })
      .trim()
      .escape()
      .isLength({ max: 160 })
      .withMessage(
        commonErrorsMessages.charactersLength('description', { max: 160 })
      ),
    body('isPublic')
      .optional({ nullable: true })
      .isBoolean()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const { name, description, isPublic } = req.body as {
      name?: string
      description?: string
      isPublic?: boolean
    }
    const icon = req.files?.icon
    const user = req.user.current
    const { guildId } = req.params as { guildId: string }
    const member = await Member.findOne({
      where: { userId: user.id, guildId, isOwner: true },
      include: [{ model: Guild, include: [Invitation] }]
    })
    if (member == null) {
      throw new NotFoundError()
    }

    // Handle public invitations
    let invitation = member.guild.invitations.find(
      invitation => invitation.isPublic
    )
    if (isPublic != null) {
      if (isPublic && !member.guild.isPublic) {
        invitation = await Invitation.create({
          isPublic: true,
          guildId: member.guild.id,
          expiresIn: 0,
          value: uuidv4()
        })
        member.guild.isPublic = true
      } else if (!isPublic) {
        const foundInvitation = await Invitation.findOne({
          where: { isPublic: true, guildId: member.guild.id }
        })
        if (foundInvitation != null) {
          await foundInvitation.destroy()
        }
        member.guild.isPublic = false
        invitation = undefined
      }
    }

    member.guild.name = name ?? member.guild.name
    member.guild.description = description ?? member.guild.description
    const resultUpload = await uploadImage({
      image: icon,
      propertyName: 'icon',
      imageName: `${member.guild.name}-${member.guild.id as string}`,
      imagesPath: guildsIconPath
    })
    if (resultUpload != null) {
      member.guild.icon = `/images/guilds/${resultUpload}`
    }

    await member.guild.save()
    const guild = member.guild.toJSON() as ObjectAny
    guild.publicInvitation = invitation != null ? invitation.value : null
    delete guild.invitations

    socket.io?.emit('guilds', { action: 'update', guild })
    return res.status(200).json({ guild })
  }
)

export { putByIdGuildsRouter }
