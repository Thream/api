import request from 'supertest'

import { authenticateUserTest } from '../../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../../__test__/utils/formatErrors'
import application from '../../../../application'
import Channel from '../../../../models/Channel'
import { errorsMessages } from '../delete'
import { createChannels } from '../../__test__/utils/createChannel'

describe('DELETE /channels/:channelId', () => {
  it('succeeds and delete the channel', async () => {
    const channel1 = { name: 'general1', description: 'testing' }
    const result = await createChannels([channel1])
    const channelToDelete = result.channels[0]
    const response = await request(application)
      .delete(`/channels/${channelToDelete.id as number}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send()
      .expect(200)
    expect(response.body.deletedChannelId).toEqual(channelToDelete.id)
    const foundChannel = await Channel.findOne({
      where: { id: channelToDelete.id }
    })
    expect(foundChannel).toBeNull()
  })

  it("fails if the channel doesn't exist", async () => {
    const userToken = await authenticateUserTest()
    const response = await request(application)
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
    const result = await createChannels([channel1])
    const channelToDelete = result.channels[0]
    const userToken = await authenticateUserTest()
    const response = await request(application)
      .delete(`/channels/${channelToDelete.id as number}`)
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })

  it("fails if it's the default channel", async () => {
    const result = await createChannels([])
    const defaultChannel = await Channel.findOne({
      where: { guildId: result.guild.id as number, isDefault: true }
    })
    expect(defaultChannel).not.toBeNull()
    const response = await request(application)
      .delete(`/channels/${defaultChannel?.id as number}`)
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
