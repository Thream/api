import request from 'supertest'

import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../../../__test__/utils/formatErrors'
import app from '../../../../../app'
import { createGuild } from '../../../__test__/utils/createGuild'

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
    const response = await request(app)
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
    const response = await request(app)
      .post(`/guilds/${result.guild.id as number}/invitations`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ expiresIn: 0 })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(
      expect.arrayContaining(['Value should not be empty'])
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
    const response = await request(app)
      .post(`/guilds/${result.guild.id as number}/invitations`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ value: 'random value' })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Value must be a slug']))
  })

  it('fails with negative expiresIn', async () => {
    const result = await createGuild({
      guild: { description: 'description', name: 'guild' },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const response = await request(app)
      .post(`/guilds/${result.guild.id as number}/invitations`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ value: 'awesome', expiresIn: -42 })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['ExpiresIn must be >= 0']))
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
    await request(app)
      .post(`/guilds/${result.guild.id as number}/invitations`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ value })
      .expect(200)
    const response = await request(app)
      .post(`/guilds/${result.guild.id as number}/invitations`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ value })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Value is already taken']))
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
    const response = await request(app)
      .post(`/guilds/${result.guild.id as number}/invitations`)
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ value: 'value' })
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })
})
