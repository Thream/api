import request from 'supertest'

import application from '../../../../application'
import Guild from '../../../../models/Guild'
import Invitation from '../../../../models/Invitation'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import {
  createGuild,
  CreateGuildResult
} from '../../../guilds/__test__/utils/createGuild'

interface InvitationOptions {
  value?: string
  /** expiresIn is how long, in milliseconds, until the invitation expires. Note: 0 = never expires */
  expiresIn?: number
  isPublic?: boolean
  guildName?: string
  guildId?: number
}

interface CreateInvitationResult extends CreateGuildResult {
  invitation: Invitation
}

export const createInvitation = async (
  invitation: InvitationOptions = {}
): Promise<CreateInvitationResult | null> => {
  let {
    value = 'awesome',
    expiresIn = 0,
    isPublic = false,
    guildName = 'guild',
    guildId
  } = invitation
  const user = {
    email: 'test@test.com',
    name: 'Test'
  }
  let result: CreateGuildResult | null = null
  if (guildId == null) {
    result = await createGuild({
      guild: { description: 'description', name: guildName },
      user
    })
    guildId = result.guild.id
  } else {
    const userToken = await authenticateUserTest({
      email: user.email,
      name: user.name,
      alreadySignedUp: true
    })
    const guild = (await Guild.findOne({ where: { id: guildId } })) as Guild
    result = {
      user: {
        accessToken: userToken.accessToken,
        type: userToken.type,
        id: userToken.userId
      },
      guild
    }
  }
  if (result != null) {
    const response = await request(application)
      .post(`/guilds/${guildId as number}/invitations`)
      .set('Authorization', `${result?.user.type} ${result?.user.accessToken}`)
      .send({ value, expiresIn, isPublic })
      .expect(201)
    return {
      ...result,
      invitation: response.body.invitation
    }
  }
  return null
}
