import request from 'supertest'

import application from '../../../../application'
import Channel from '../../../../models/Channel'
import Message from '../../../../models/Message'
import { createChannels } from '../../../channels/__test__/utils/createChannel'
import { CreateGuildResult } from '../../../guilds/__test__/utils/createGuild'

interface CreateMessagesResult extends CreateGuildResult {
  channels: Channel[]
  channelId: number
  messages: Message[]
}

export const createMessages = async (
  messages: string[]
): Promise<CreateMessagesResult> => {
  const channel1 = { name: 'general1', description: 'testing' }
  const result = await createChannels([channel1])
  const messagesResponses: Message[] = []
  const channelId = result.channels[0].id as number
  for (const message of messages) {
    const response = await request(application)
      .post(`/channels/${channelId}/messages`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ value: message, type: 'text' })
      .expect(201)
    messagesResponses.push(response.body.message)
  }
  return {
    ...result,
    channelId,
    messages: messagesResponses
  }
}
