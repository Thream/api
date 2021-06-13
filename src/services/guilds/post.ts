import { Request, Response, Router } from 'express'
import fileUpload from 'express-fileupload'
import { body } from 'express-validator'

import { authenticateUser } from '../../tools/middlewares/authenticateUser'
import { validateRequest } from '../../tools/middlewares/validateRequest'
import Channel from '../../models/Channel'
import Guild from '../../models/Guild'
import Member from '../../models/Member'
import {
  commonErrorsMessages,
  guildsIconPath,
  imageFileUploadOptions
} from '../../tools/configurations/constants'
import { alreadyUsedValidation } from '../../tools/validations/alreadyUsedValidation'
import { ForbiddenError } from '../../tools/errors/ForbiddenError'
import { uploadImage } from '../../tools/utils/uploadImage'

export const postGuildsRouter = Router()

postGuildsRouter.post(
  '/guilds',
  authenticateUser,
  fileUpload(imageFileUploadOptions),
  [
    body('name')
      .trim()
      .escape()
      .notEmpty()
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
      )
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const { name, description = '' } = req.body as {
      name: string
      description?: string
    }
    const icon = req.files?.icon
    const user = req.user.current
    const resultUpload = await uploadImage({
      image: icon,
      propertyName: 'icon',
      oldImage: `${guildsIconPath.name}/default.png`,
      imagesPath: guildsIconPath.filePath
    })
    const guild = await Guild.create({ name, description })
    const channel = await Channel.create({
      name: 'general',
      isDefault: true,
      guildId: guild.id
    })
    await Member.create({
      userId: user.id,
      guildId: guild.id,
      isOwner: true,
      lastVisitedChannelId: channel.id
    })
    if (resultUpload != null) {
      guild.icon = `${guildsIconPath.name}/${resultUpload}`
      await guild.save()
    }
    return res.status(201).json({ guild })
  }
)
