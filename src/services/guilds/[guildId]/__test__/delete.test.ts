import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../../__test__/utils/formatErrors'
import application from '../../../../application'
import Guild from '../../../../models/Guild'
import { createGuild } from '../../__test__/utils/createGuild'

describe('DELETE /guilds/:guildId', () => {
  it('succeeds and delete the guild', async () => {
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
      .delete(`/guilds/${result.guild.id as number}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send()
      .expect(200)
    expect(response.body.deletedGuildId).toEqual(result.guild.id)
    const foundGuild = await Guild.findOne({ where: { id: result?.guild.id as number } })
    expect(foundGuild).toBeNull()
  })

  it("fails if the guild doesn't exist", async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .delete('/guilds/23')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })

  it("fails if the user isn't the owner", async () => {
    const name = 'guild'
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
      .delete(`/guilds/${result.guild.id as number}`)
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })
})
