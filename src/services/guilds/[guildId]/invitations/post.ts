import { Request, Response, Router } from 'express'
import { body } from 'express-validator'

import { authenticateUser } from '../../../../tools/middlewares/authenticateUser'
import { validateRequest } from '../../../../tools/middlewares/validateRequest'
import Invitation from '../../../../models/Invitation'
import Member from '../../../../models/Member'
import { commonErrorsMessages } from '../../../../tools/configurations/constants'
import { alreadyUsedValidation } from '../../../../tools/validations/alreadyUsedValidation'
import { BadRequestError } from '../../../../tools/errors/BadRequestError'
import { ForbiddenError } from '../../../../tools/errors/ForbiddenError'
import { NotFoundError } from '../../../../tools/errors/NotFoundError'

export const errorsMessages = {
  value: {
    mustBeSlug: 'Value must be a slug',
    shouldNotBeEmpty: 'Value should not be empty'
  },
  expiresIn: {
    mustBeGreaterOrEqual: 'ExpiresIn must be >= 0'
  },
  public: {
    alreadyHasInvitation: 'There is already a public invitation for this guild'
  }
}

export const postInvitationsRouter = Router()

postInvitationsRouter.post(
  '/guilds/:guildId/invitations',
  authenticateUser,
  [
    body('value')
      .notEmpty()
      .withMessage(errorsMessages.value.shouldNotBeEmpty)
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
    const { value, expiresIn = 0, isPublic = false } = req.body as {
      value: string
      expiresIn?: number
      isPublic?: boolean
    }
    const { guildId } = req.params as { guildId: string }
    const member = await Member.findOne({
      where: { userId: user.id, guildId, isOwner: true }
    })
    if (member == null) {
      throw new NotFoundError()
    }
    const foundInvitation = await Invitation.findOne({
      where: { isPublic: true, guildId: member.guildId }
    })
    if (isPublic && foundInvitation != null) {
      throw new BadRequestError(errorsMessages.public.alreadyHasInvitation)
    }
    let expiresInValue = expiresIn
    if (expiresInValue > 0) {
      expiresInValue += Date.now()
    }
    const invitation = await Invitation.create({
      value,
      expiresIn,
      isPublic,
      guildId: member.guildId
    })
    return res.status(201).json({ invitation })
  }
)
