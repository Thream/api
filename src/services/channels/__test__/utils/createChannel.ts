import request from 'supertest'

import application from '../../../../application'
import Channel from '../../../../models/Channel'
import {
  createGuild,
  CreateGuildResult
} from '../../../guilds/__test__/utils/createGuild'

interface ChannelOptions {
  name: string
  description: string
}

interface CreateChannelsResult extends CreateGuildResult {
  channels: Channel[]
}

export const createChannels = async (
  channels: ChannelOptions[]
): Promise<CreateChannelsResult> => {
  const result = await createGuild({
    guild: { description: 'description', name: 'guild' },
    user: {
      email: 'test@test.com',
      name: 'Test'
    }
  })
  const channelsResponses: Channel[] = []
  for (const { name, description } of channels) {
    const response = await request(application)
      .post(`/guilds/${result.guild.id as number}/channels`)
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
