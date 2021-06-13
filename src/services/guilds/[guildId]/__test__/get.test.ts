import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../../__test__/utils/formatErrors'
import application from '../../../../application'
import { createGuild } from '../../__test__/utils/createGuild'

describe('GET /guilds/:guildId', () => {
  it('succeeds and get the guild', async () => {
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
      .get(`/guilds/${result.guild.id as number}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send()
      .expect(200)
    expect(response.body.guild.name).toEqual(name)
    expect(response.body.guild.description).toEqual(description)
  })

  it("fails if the user isn't a member", async () => {
    const result = await createGuild({
      guild: { description: 'testing', name: 'guild' },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .get(`/guilds/${result.guild.id as number}`)
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })

  it("fails if the guild doesn't exist", async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .get('/guilds/23')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })
})
