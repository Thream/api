import request from 'supertest'

import app from '../../../app'
import { createChannel } from './utils/createChannel'

describe('GET /channels/guilds/:guildId', () => {
  it('should get all the channels of the guild', async () => {
    const channel1 = { name: 'general1', description: 'testing' }
    const channel2 = { name: 'general2', description: 'testing' }
    const result = await createChannel([channel1, channel2])
    const response = await request(app)
      .get(`/channels/guilds/${result.guild.id}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send()
      .expect(200)
    expect(response.body.hasMore).toBeFalsy()
    expect(response.body.rows.length).toEqual(3)
    expect(response.body.rows[0].name).toEqual(channel2.name)
    expect(response.body.rows[0].description).toEqual(channel2.description)
    expect(response.body.rows[1].name).toEqual(channel1.name)
    expect(response.body.rows[1].description).toEqual(channel1.description)
  })
})
