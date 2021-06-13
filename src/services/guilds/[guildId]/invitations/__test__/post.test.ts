import request from 'supertest'

import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../../../__test__/utils/formatErrors'
import application from '../../../../../application'
import { createGuild } from '../../../__test__/utils/createGuild'
import { errorsMessages } from '../post'
import { commonErrorsMessages } from '../../../../../tools/configurations/constants'

describe('POST /guilds/:guildId/invitations', () => {
  it('succeeds and create the invitation', async () => {
    const value = 'random'
    const expiresIn = 0
    const isPublic = false
    const result = await createGuild({
      guild: { description: 'description', name: 'guild' },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const response = await request(application)
      .post(`/guilds/${result.guild.id as number}/invitations`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ value, expiresIn, isPublic })
      .expect(201)
    expect(response.body.invitation.value).toEqual(value)
    expect(response.body.invitation.expiresIn).toEqual(expiresIn)
    expect(response.body.invitation.isPublic).toEqual(isPublic)
  })

  it('fails with empty value', async () => {
    const result = await createGuild({
      guild: { description: 'description', name: 'guild' },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const response = await request(application)
      .post(`/guilds/${result.guild.id as number}/invitations`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ expiresIn: 0 })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(3)
    expect(errors).toEqual(
      expect.arrayContaining([
        errorsMessages.value.shouldNotBeEmpty,
        errorsMessages.value.mustBeSlug,
        commonErrorsMessages.charactersLength('value', { max: 250, min: 1 })
      ])
    )
  })

  it('fails with invalid slug value', async () => {
    const result = await createGuild({
      guild: { description: 'description', name: 'guild' },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const response = await request(application)
      .post(`/guilds/${result.guild.id as number}/invitations`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ value: 'random value' })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(
      expect.arrayContaining([errorsMessages.value.mustBeSlug])
    )
  })

  it('fails with negative expiresIn', async () => {
    const result = await createGuild({
      guild: { description: 'description', name: 'guild' },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const response = await request(application)
      .post(`/guilds/${result.guild.id as number}/invitations`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ value: 'awesome', expiresIn: -42 })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(
      expect.arrayContaining([errorsMessages.expiresIn.mustBeGreaterOrEqual])
    )
  })

  it('fails if the invitation slug value already exists', async () => {
    const value = 'awesome'
    const result = await createGuild({
      guild: { description: 'description', name: 'guild' },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    await request(application)
      .post(`/guilds/${result.guild.id as number}/invitations`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ value })
      .expect(201)
    const response = await request(application)
      .post(`/guilds/${result.guild.id as number}/invitations`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ value })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Value already used']))
  })

  it('fails with isPublic: true - if there is already a public invitation for this guild', async () => {
    const result = await createGuild({
      guild: { description: 'description', name: 'guild' },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    await request(application)
      .post(`/guilds/${result.guild.id as number}/invitations`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ value: 'awesome', isPublic: true })
      .expect(201)
    const response = await request(application)
      .post(`/guilds/${result.guild.id as number}/invitations`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ value: 'awesome2', isPublic: true })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(
      expect.arrayContaining([errorsMessages.public.alreadyHasInvitation])
    )
  })

  it('fails if the user is not the owner', async () => {
    const userToken = await authenticateUserTest()
    const result = await createGuild({
      guild: { description: 'description', name: 'guild' },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const response = await request(application)
      .post(`/guilds/${result.guild.id as number}/invitations`)
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ value: 'value' })
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })
})
