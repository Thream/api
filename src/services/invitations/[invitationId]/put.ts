import { Request, Response, Router } from 'express'
import { body } from 'express-validator'

import { authenticateUser } from '../../../tools/middlewares/authenticateUser'
import { validateRequest } from '../../../tools/middlewares/validateRequest'
import Invitation from '../../../models/Invitation'
import Member from '../../../models/Member'
import { commonErrorsMessages } from '../../../tools/configurations/constants'
import { alreadyUsedValidation } from '../../../tools/validations/alreadyUsedValidation'
import { BadRequestError } from '../../../tools/errors/BadRequestError'
import { ForbiddenError } from '../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../tools/errors/NotFoundError'
import Guild from '../../../models/Guild'

export const errorsMessages = {
  value: {
    mustBeSlug: 'Value must be a slug'
  },
  expiresIn: {
    mustBeGreaterOrEqual: 'ExpiresIn must be >= 0'
  },
  public: {
    alreadyHasInvitation: 'There is already a public invitation for this guild'
  }
}

export const putInvitationsRouter = Router()

putInvitationsRouter.put(
  '/invitations/:invitationId',
  authenticateUser,
  [
    body('value')
      .optional({ nullable: true })
      .trim()
      .escape()
      .isLength({ max: 250, min: 1 })
      .withMessage(
        commonErrorsMessages.charactersLength('value', { max: 250, min: 1 })
      )
      .isSlug()
      .withMessage(errorsMessages.value.mustBeSlug)
      .custom(async (value: string) => {
        return await alreadyUsedValidation(Invitation, 'value', value)
      }),
    body('expiresIn')
      .optional({ nullable: true })
      .isInt({ min: 0 })
      .withMessage(errorsMessages.expiresIn.mustBeGreaterOrEqual),
    body('isPublic').optional({ nullable: true }).isBoolean()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const { value, expiresIn, isPublic } = req.body as {
      value?: string
      expiresIn?: number
      isPublic?: boolean
    }
    const { invitationId } = req.params as { invitationId: string }
    const invitation = await Invitation.findOne({ where: { id: invitationId } })
    if (invitation == null) {
      throw new NotFoundError()
    }
    const member = await Member.findOne({
      where: { userId: user.id, guildId: invitation.guildId, isOwner: true },
      include: [Guild]
    })
    if (member == null) {
      throw new NotFoundError()
    }
    if (invitation.isPublic && expiresIn != null) {
      throw new BadRequestError('You can\'t edit "expiresIn" if it is a public invitation')
    }
    if (member.guild.isPublic && isPublic != null && !isPublic) {
      throw new BadRequestError('You can\'t edit "isPublic" if the guild is still public')
    }
    let expiresInValue = expiresIn ?? invitation.expiresIn
    if (expiresInValue > 0 && expiresIn != null) {
      expiresInValue += Date.now()
    }
    invitation.value = value ?? invitation.value
    invitation.expiresIn = expiresInValue
    invitation.isPublic = isPublic != null ? isPublic : invitation.isPublic
    const foundInvitation = await Invitation.findOne({
      where: { isPublic: true, guildId: member.guildId }
    })
    if (isPublic != null && isPublic && foundInvitation != null) {
      throw new BadRequestError(errorsMessages.public.alreadyHasInvitation)
    }
    await invitation.save()
    return res.status(200).json({ invitation })
  }
)
