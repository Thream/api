import request from 'supertest'

import application from '../../../../../application'
import { createChannels } from '../../../../channels/__test__/utils/createChannel'

describe('GET /guilds/:guildId/channels', () => {
  it('should get all the channels of the guild', async () => {
    const channel1 = { name: 'general1', description: 'testing' }
    const channel2 = { name: 'general2', description: 'testing' }
    const result = await createChannels([channel1, channel2])
    const response = await request(application)
      .get(`/guilds/${result.guild.id as number}/channels/`)
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
