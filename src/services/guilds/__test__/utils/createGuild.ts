import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import application from '../../../../application'
import Member from '../../../../models/Member'

interface CreateGuildOptions {
  user: {
    email?: string
    name?: string
    tokenResponse?: {
      userId: number
      accessToken: string
      type: 'Bearer'
    }
  }
  guild: {
    name: string
    description: string
    shouldBePublic?: boolean
  }
}

export interface CreateGuildResult {
  user: {
    id: number
    accessToken: string
    type: 'Bearer'
  }
  guild: {
    id?: number
    name: string
    description: string
    icon: string
    isPublic: boolean
  }
}

export const createGuild = async (
  options: CreateGuildOptions
): Promise<CreateGuildResult> => {
  const { user, guild } = options
  let userToken = { type: 'Bearer', accessToken: '', userId: 1 }
  if (user.email != null && user.name != null) {
    userToken = await authenticateUserTest({
      email: user.email,
      name: user.name,
      shouldBeConfirmed: true
    })
  }
  if (user.tokenResponse != null) {
    userToken = user.tokenResponse
  }
  let response = await request(application)
    .post('/guilds')
    .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
    .send({ name: guild.name, description: guild.description })
    .expect(201)
  expect(response.body.guild).not.toBeNull()
  const member = await Member.findOne({ where: { userId: userToken.userId } })
  expect(member).not.toBeNull()
  expect(member?.isOwner).toBeTruthy()
  expect(member?.guildId).toEqual(response.body.guild.id)
  if (member == null) {
    throw new Error('"member" should not be null')
  }

  if (guild.shouldBePublic != null && guild.shouldBePublic) {
    response = await request(application)
      .put(`/guilds/${response.body.guild.id as string}`)
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ isPublic: true })
      .expect(200)
  }

  return {
    user: {
      id: userToken.userId,
      accessToken: userToken.accessToken,
      type: 'Bearer'
    },
    guild: { ...response.body.guild }
  }
}
