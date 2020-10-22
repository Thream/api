import { Request, Response, Router } from 'express'
import fileUpload from 'express-fileupload'
import { body } from 'express-validator'

import { authenticateUser } from '../../middlewares/authenticateUser'
import { validateRequest } from '../../middlewares/validateRequest'
import Channel from '../../models/Channel'
import Guild from '../../models/Guild'
import Member from '../../models/Member'
import {
  commonErrorsMessages,
  guildsIconPath,
  imageFileUploadOptions
} from '../../utils/config/constants'
import { alreadyUsedValidation } from '../../utils/database/alreadyUsedValidation'
import { ForbiddenError } from '../../utils/errors/ForbiddenError'
import { uploadImage } from '../../utils/uploadImage'

const postGuildsRouter = Router()

postGuildsRouter.post(
  '/',
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
    const { name, description } = req.body as {
      name: string
      description?: string
    }
    const icon = req.files?.icon
    const user = req.user.current

    const guild = await Guild.create({ name, description: description ?? '' })
    await Member.create({
      userId: user.id,
      guildId: guild.id,
      isOwner: true
    })
    await Channel.create({
      name: 'general',
      isDefault: true,
      guildId: guild.id
    })

    const resultUpload = await uploadImage({
      image: icon,
      propertyName: 'icon',
      imageName: `${guild.name}-${guild.id as string}`,
      imagesPath: guildsIconPath
    })
    if (resultUpload != null) {
      guild.icon = `/images/guilds/${resultUpload}`
      await guild.save()
    }

    return res.status(201).json({ guild })
  }
)

export { postGuildsRouter }
