import request from 'supertest'

import app from '../../../app'
import { createGuild } from './utils/createGuild'

describe('GET /guilds', () => {
  it('should get all the guild of the member', async () => {
    const name = 'guild'
    const description = 'testing'
    const guild = await createGuild({
      guild: { description, name },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })

    // Should not be included in the response because it's created by another user
    await createGuild({
      guild: { description, name: 'guild2' },
      user: {
        email: 'test@test2.com',
        name: 'Test2'
      }
    })

    const response = await request(app)
      .get('/guilds')
      .set('Authorization', `${guild.user.type} ${guild.user.accessToken}`)
      .send()
      .expect(200)
    expect(response.body.hasMore).toBeFalsy()
    expect(response.body.rows.length).toEqual(1)
    expect(response.body.rows[0].name).toEqual(name)
    expect(response.body.rows[0].description).toEqual(description)
  })
})
