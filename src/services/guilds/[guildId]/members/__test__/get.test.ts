import request from 'supertest'

import application from '../../../../../application'
import Member from '../../../../../models/Member'
import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUser'
import { createGuild } from '../../../__test__/utils/createGuild'

describe('GET /guilds/:guildId/members', () => {
  it('should get all the members of a guild', async () => {
    const result = await createGuild({
      guild: { description: 'description', name: 'guild' },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const userToken = await authenticateUserTest()
    await Member.create({
      userId: userToken.userId,
      guildId: result.guild.id,
      lastVisitedChannelId: 1
    })
    const response = await request(application)
      .get(`/guilds/${result.guild.id as number}/members`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send()
      .expect(200)
    expect(response.body.hasMore).toBeFalsy()
    expect(response.body.totalItems).toEqual(2)
    expect(response.body.rows[0].guildId).toEqual(result.guild.id)
    expect(response.body.rows[1].guildId).toEqual(result.guild.id)
    expect(response.body.rows[1].user).not.toBeNull()
    expect(response.body.rows[1].user.password).not.toBeDefined()
  })
})
