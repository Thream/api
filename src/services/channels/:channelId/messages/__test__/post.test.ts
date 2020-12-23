import request from 'supertest'

import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../../../__test__/utils/formatErrors'
import app from '../../../../../app'
import { createChannels } from '../../../__test__/utils/createChannel'
import { commonErrorsMessages } from '../../../../../utils/config/constants'

const channel1 = { name: 'general1', description: 'testing' }

describe('POST /channels/:channelId/messages', () => {
  it('succeeds and create the message', async () => {
    const value = 'my awesome message'
    const result = await createChannels([channel1])
    expect(result.channels.length).toEqual(1)
    const channel = result.channels[0]
    const response = await request(app)
      .post(`/channels/${channel.id as number}/messages`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ value })
      .expect(201)
    expect(response.body.message).not.toBeNull()
    expect(response.body.message.value).toEqual(value)
    expect(response.body.message.type).toEqual('text')
    expect(response.body.message.user).not.toBeNull()
    expect(response.body.message.user.id).toEqual(result.user.id)
  })

  it('fails with no message value', async () => {
    const result = await createChannels([channel1])
    const channel = result.channels[0]
    const response = await request(app)
      .post(`/channels/${channel.id as number}/messages`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send()
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(
      expect.arrayContaining([
        commonErrorsMessages.charactersLength('value', { min: 1, max: 10_000 })
      ])
    )
  })

  it('fails if the user is not in the guild with this channel', async () => {
    const result = await createChannels([channel1])
    const channel = result.channels[0]
    const userToken = await authenticateUserTest()
    const response = await request(app)
      .post(`/channels/${channel.id as number}/messages`)
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send({ value: 'some random message' })
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })
})
