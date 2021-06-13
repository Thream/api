import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../../__test__/utils/formatErrors'
import application from '../../../../application'
import Guild from '../../../../models/Guild'
import Invitation from '../../../../models/Invitation'
import { commonErrorsMessages } from '../../../../tools/configurations/constants'
import { randomString } from '../../../../tools/utils/random'
import { createGuild } from '../../__test__/utils/createGuild'

describe('PUT /guilds/:guildId', () => {
  it('succeeds and edit the guild', async () => {
    const name = 'guild'
    const newName = 'guildtest'
    const description = 'testing'
    const newDescription = 'new description'
    const result = await createGuild({
      guild: { description, name },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const response = await request(application)
      .put(`/guilds/${result.guild.id as number}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ name: newName, description: newDescription })
      .expect(200)
    expect(response.body.guild.name).toEqual(newName)
    expect(response.body.guild.description).toEqual(newDescription)
    expect(response.body.guild.publicInvitation).toBeNull()
    const foundGuild = await Guild.findOne({
      where: { id: result?.guild.id as number }
    })
    expect(foundGuild?.name).toEqual(newName)
    expect(foundGuild?.description).toEqual(newDescription)
  })

  it('succeeds and create/delete public invitations', async () => {
    const name = 'guild'
    const description = 'testing'
    const result = await createGuild({
      guild: { description, name },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const resIsPublic = await request(application)
      .put(`/guilds/${result.guild.id as number}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ isPublic: true })
      .expect(200)
    expect(resIsPublic.body.guild.isPublic).toBeTruthy()
    expect(typeof resIsPublic.body.guild.publicInvitation).toBe('string')
    const publicInvitation = await Invitation.findOne({
      where: { isPublic: true, guildId: result?.guild.id as number }
    })
    expect(publicInvitation).not.toBeNull()
    expect(publicInvitation?.expiresIn).toEqual(0)

    const resIsNotPublic = await request(application)
      .put(`/guilds/${result.guild.id as number}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ isPublic: false })
      .expect(200)
    expect(resIsNotPublic.body.guild.isPublic).toBeFalsy()
    expect(resIsNotPublic.body.guild.publicInvitation).toBeNull()
    const notPublicInvitation = await Invitation.findOne({
      where: { isPublic: false, guildId: result?.guild.id as number }
    })
    expect(notPublicInvitation).toBeNull()
  })

  it("fails if the user isn't the owner", async () => {
    const name = 'guild'
    const newName = 'guildtest'
    const description = 'testing'
    const result = await createGuild({
      guild: { description, name },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .put(`/guilds/${result.guild.id as number}`)
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ name: newName })
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })

  it("fails if the guild doesn't exist", async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .put('/guilds/23')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ name: 'kjdjhdjh' })
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })

  it('fails with invalid name', async () => {
    const name = 'guild'
    const description = 'testing'
    const result = await createGuild({
      guild: { description, name },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const response = await request(application)
      .put(`/guilds/${result.guild.id as number}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ name: randomString(35) })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(
      expect.arrayContaining([
        commonErrorsMessages.charactersLength('name', { max: 30, min: 3 })
      ])
    )
  })

  it('fails with name already used', async () => {
    const { guild } = await createGuild({
      guild: { description: 'testing', name: 'guild' },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const result = await createGuild({
      guild: { description: 'testing', name: 'guild2' },
      user: {
        email: 'test@test2.com',
        name: 'Test2'
      }
    })
    const response = await request(application)
      .put(`/guilds/${result.guild.id as number}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ name: guild.name })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Name already used']))
  })

  it('fails with invalid description', async () => {
    const name = 'guild'
    const description = 'testing'
    const result = await createGuild({
      guild: { description, name },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const response = await request(application)
      .put(`/guilds/${result.guild.id as number}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ description: randomString(165) })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(
      expect.arrayContaining([
        commonErrorsMessages.charactersLength('description', { max: 160 })
      ])
    )
  })
})
