import { Request, Response, Router } from 'express'
import fileUpload from 'express-fileupload'
import { body, query } from 'express-validator'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import { authenticateUser } from '../../middlewares/authenticateUser'
import { validateRequest } from '../../middlewares/validateRequest'
import RefreshToken from '../../models/RefreshToken'
import User from '../../models/User'
import {
  commonErrorsMessages,
  imageFileUploadOptions,
  imagesPath
} from '../../utils/config/constants'
import { alreadyUsedValidation } from '../../utils/database/alreadyUsedValidation'
import { ForbiddenError } from '../../utils/errors/ForbiddenError'
import { UnauthorizedError } from '../../utils/errors/UnauthorizedError'
import { uploadImage } from '../../utils/uploadImage'
import { sendConfirmEmail } from './utils/sendConfirmEmail'

const usersLogoPath = path.join(imagesPath, 'users')

export const errorsMessages = {
  email: {
    mustBeValid: 'Email must be valid',
    alreadyConnected: 'You are already connected with this email address'
  },
  name: {
    alreadyConnected: 'You are already connected with this name'
  }
}

const currentRouter = Router()

currentRouter.get('/', authenticateUser, (req: Request, res: Response) => {
  return res
    .status(200)
    .json({ user: req.user?.current, strategy: req.user?.strategy })
})

currentRouter.put(
  '/',
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
    query('redirectURI')
      .optional({ nullable: true })
      .trim()
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
      imageName: `${user.name}-${user.id as string}`,
      imagesPath: usersLogoPath
    })
    if (resultUpload != null) {
      user.logo = `/images/guilds/${resultUpload}`
    }

    // If the email changed, the user should confirm the new email
    if (email != null) {
      user.email = email

      // Signout the user if he is using local strategy
      if (req.user.strategy === 'local') {
        const refreshTokens = await RefreshToken.findAll({
          where: { userId: user.id }
        })
        if (refreshTokens == null) {
          throw new UnauthorizedError()
        }

        // Delete all refreshTokens
        for (const refreshToken of refreshTokens) {
          await refreshToken.destroy()
        }
      }

      const tempToken = uuidv4()
      user.tempToken = tempToken
      user.isConfirmed = false
      await sendConfirmEmail({
        email,
        tempToken,
        redirectURI,
        subject: 'SocialProject - Confirm email',
        renderOptions: {
          subtitle: 'Please confirm your email',
          buttonText: 'Yes, I confirm',
          footerText:
            'If you received this message by mistake, just delete it. Your email will not be confirmed if you do not click on the confirmation link above.'
        }
      })
    }

    const userSaved = await user.save()
    return res
      .status(200)
      .json({ user: userSaved, strategy: req.user?.strategy })
  }
)

export { currentRouter }
