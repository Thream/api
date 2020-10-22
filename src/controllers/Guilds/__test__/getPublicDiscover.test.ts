import request from 'supertest'

import { authenticateUserTest } from '../../../__test__/utils/authenticateUser'
import app from '../../../app'
import { createGuild } from './utils/createGuild'

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

    // Should not be included in the response because it isn't public
    await createGuild({
      guild: { description, name: 'guild2' },
      user: {
        email: 'test@test2.com',
        name: 'Test2'
      }
    })

    const userToken = await authenticateUserTest()
    const response = await request(app)
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
