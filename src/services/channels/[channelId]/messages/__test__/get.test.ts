import request from 'supertest'

import application from '../../../../../application'
import { createMessages } from '../../../../messages/__test__/utils/createMessages'

describe('GET /channels/:channelId/messages', () => {
  it('should get all the messages of the channel', async () => {
    const messages = ['Hello world!', 'some random message']
    const result = await createMessages(messages)
    const response = await request(application)
      .get(`/channels/${result.channelId}/messages`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send()
      .expect(200)
    expect(response.body.hasMore).toBeFalsy()
    expect(response.body.totalItems).toEqual(messages.length)
    expect(response.body.rows[0].value).toEqual(messages[0])
    expect(response.body.rows[1].value).toEqual(messages[1])
    expect(response.body.rows[1].user).not.toBeNull()
    expect(response.body.rows[1].user.id).toEqual(result.user.id)
    expect(response.body.rows[1].user.password).not.toBeDefined()
  })
})
