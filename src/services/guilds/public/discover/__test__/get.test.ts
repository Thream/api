import request from 'supertest'

import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUser'
import application from '../../../../../application'
import { createGuild } from '../../../__test__/utils/createGuild'

describe('GET /guilds/public/discover', () => {
  it('should get all the public guilds', async () => {
    const name = 'guild'
    const description = 'testing'
    await createGuild({
      guild: { description, name, shouldBePublic: true },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .get('/guilds/public/discover')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(200)
    expect(response.body.hasMore).toBeFalsy()
    expect(response.body.rows.length).toEqual(1)
    expect(response.body.rows[0].name).toEqual(name)
    expect(response.body.rows[0].description).toEqual(description)
    expect(typeof response.body.rows[0].publicInvitation).toBe('string')
  })
})
