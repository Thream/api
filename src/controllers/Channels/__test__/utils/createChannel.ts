import request from 'supertest'

import app from '../../../../app'
import Channel from '../../../../models/Channel'
import { createGuild } from '../../../Guilds/__test__/utils/createGuild'

interface ChannelOptions {
  name: string
  description: string
}

export const createChannel = async (
  channels: ChannelOptions[]
): Promise<{
  user: {
    id: number
    accessToken: string
    type: 'Bearer'
  }
  guild: {
    id: number
    name: string
    description: string
    icon: string
    isPublic: boolean
  }
  channels: Channel[]
}> => {
  const result = await createGuild({
    guild: { description: 'description', name: 'guild' },
    user: {
      email: 'test@test.com',
      name: 'Test'
    }
  })
  const channelsResponses: Channel[] = []
  for (const { name, description } of channels) {
    const response = await request(app)
      .post(`/channels/guilds/${result.guild.id}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ name, description })
      .expect(201)
    channelsResponses.push(response.body.channel)
  }

  return {
    ...result,
    channels: channelsResponses
  }
}
