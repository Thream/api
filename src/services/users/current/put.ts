import { Request, Response, Router } from 'express'
import fileUpload from 'express-fileupload'
import { body, query } from 'express-validator'
import { v4 as uuidv4 } from 'uuid'

import { authenticateUser } from '../../../tools/middlewares/authenticateUser'
import { validateRequest } from '../../../tools/middlewares/validateRequest'
import User from '../../../models/User'
import {
  commonErrorsMessages,
  imageFileUploadOptions,
  usersLogoPath
} from '../../../tools/configurations/constants'
import { alreadyUsedValidation } from '../../../tools/validations/alreadyUsedValidation'
import { ForbiddenError } from '../../../tools/errors/ForbiddenError'
import { uploadImage } from '../../../tools/utils/uploadImage'
import { deleteEveryRefreshTokens } from '../__utils__/deleteEveryRefreshTokens'
import UserSetting from '../../../models/UserSetting'
import { sendEmail } from '../../../tools/email/sendEmail'

export const errorsMessages = {
  email: {
    mustBeValid: 'Email must be valid',
    alreadyConnected: 'You are already connected with this email address'
  },
  name: {
    alreadyConnected: 'You are already connected with this name'
  }
}

export const putCurrentRouter = Router()

putCurrentRouter.put(
  '/users/current',
  authenticateUser,
  fileUpload(imageFileUploadOptions),
  [
    body('email')
      .optional({ nullable: true })
      .trim()
      .isEmail()
      .withMessage(errorsMessages.email.mustBeValid)
      .custom(async (email: string, meta) => {
        if (email === meta.req.user?.current.email) {
          return await Promise.reject(
            new Error(errorsMessages.email.alreadyConnected)
          )
        }
        return await alreadyUsedValidation(User, 'email', email)
      }),
    body('name')
      .optional({ nullable: true })
      .trim()
      .escape()
      .isLength({ max: 30, min: 3 })
      .withMessage(
        commonErrorsMessages.charactersLength('name', { max: 30, min: 3 })
      )
      .custom(async (name: string, meta) => {
        if (name === meta.req.user?.current.name) {
          return await Promise.reject(
            new Error(errorsMessages.name.alreadyConnected)
          )
        }
        return await alreadyUsedValidation(User, 'name', name)
      }),
    body('biography')
      .optional({ nullable: true })
      .trim()
      .escape()
      .isLength({ max: 160 })
      .withMessage(
        commonErrorsMessages.charactersLength('biography', { max: 160 })
      ),
    body('status')
      .optional({ nullable: true })
      .trim()
      .escape()
      .isLength({ max: 100 })
      .withMessage(
        commonErrorsMessages.charactersLength('status', { max: 100 })
      ),
    query('redirectURI').optional({ nullable: true }).trim()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const { name, email, status, biography } = req.body as {
      name?: string
      email?: string
      status?: string
      biography?: string
    }
    const logo = req.files?.logo
    const { redirectURI } = req.query as { redirectURI?: string }
    const user = req.user.current

    user.name = name ?? user.name
    user.status = status ?? user.status
    user.biography = biography ?? user.biography

    const resultUpload = await uploadImage({
      image: logo,
      propertyName: 'logo',
      oldImage: user.logo,
      imagesPath: usersLogoPath.filePath
    })
    if (resultUpload != null) {
      user.logo = `${usersLogoPath.name}/${resultUpload}`
    }

    if (email != null) {
      user.email = email
      if (req.user.currentStrategy === 'local') {
        await deleteEveryRefreshTokens(user.id)
      }
      const tempToken = uuidv4()
      user.tempToken = tempToken
      user.isConfirmed = false
      const userSettings = await UserSetting.findOne({
        where: { userId: user.id }
      })
      const redirectQuery =
        redirectURI != null ? `&redirectURI=${redirectURI}` : ''
      await sendEmail({
        type: 'confirm-email',
        email,
        url: `${process.env.API_BASE_URL}/users/confirmEmail?tempToken=${tempToken}${redirectQuery}`,
        language: userSettings?.language,
        theme: userSettings?.theme
      })
    }

    const userSaved = await user.save()
    return res
      .status(200)
      .json({ user: userSaved, strategy: req.user.currentStrategy })
  }
)
