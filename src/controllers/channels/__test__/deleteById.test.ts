import request from 'supertest'

import { authenticateUserTest } from '../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../__test__/utils/formatErrors'
import app from '../../../app'
import Channel from '../../../models/Channel'
import { errorsMessages } from '../deleteById'
import { createChannel } from './utils/createChannel'

describe('DELETE /channels/:channelId', () => {
  it('succeeds and delete the channel', async () => {
    const channel1 = { name: 'general1', description: 'testing' }
    const result = await createChannel([channel1])
    const channelToRemove = result.channels[0]
    const response = await request(app)
      .delete(`/channels/${channelToRemove.id as string}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send()
      .expect(200)
    expect(response.body.deletedChannelId).toEqual(channelToRemove.id)
    const foundChannel = await Channel.findOne({
      where: { id: channelToRemove.id }
    })
    expect(foundChannel).toBeNull()
  })

  it("fails if the channel doesn't exist", async () => {
    const userToken = await authenticateUserTest()
    const response = await request(app)
      .delete('/channels/23')
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })

  it('fails if the user is not the owner', async () => {
    const channel1 = { name: 'general1', description: 'testing' }
    const result = await createChannel([channel1])
    const channelToRemove = result.channels[0]
    const userToken = await authenticateUserTest()
    const response = await request(app)
      .delete(`/channels/${channelToRemove.id as string}`)
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })

  it("fails if it's the default channel", async () => {
    const result = await createChannel([])
    const defaultChannel = await Channel.findOne({
      where: { guildId: result.guild.id, isDefault: true }
    })
    expect(defaultChannel).not.toBeNull()
    const response = await request(app)
      .delete(`/channels/${defaultChannel?.id as string}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send()
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(
      expect.arrayContaining([errorsMessages.channel.shouldNotBeTheDefault])
    )
  })
})
