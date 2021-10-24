import request from 'supertest'

import application from '../../../application'
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
    const response = await request(application)
      .get('/guilds')
      .set('Authorization', `${guild.user.type} ${guild.user.accessToken}`)
      .send()
      .expect(200)
    expect(response.body.hasMore).toBeFalsy()
    expect(response.body.rows.length).toEqual(1)
    expect(response.body.rows[0].isOwner).toBeTruthy()
    expect(response.body.rows[0].guild.name).toEqual(name)
    expect(response.body.rows[0].guild.description).toEqual(description)
  })
})
