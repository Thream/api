import request from 'supertest'

import { authenticateUserTest } from '../../../__test__/utils/authenticateUser'
import { formatErrors } from '../../../__test__/utils/formatErrors'
import app from '../../../app'
import Channel from '../../../models/Channel'
import { commonErrorsMessages } from '../../../utils/config/constants'
import { randomString } from '../../../utils/random'
import { errorsMessages } from '../putById'
import { createChannel } from './utils/createChannel'

describe('PUT /channels/:channelId', () => {
  it('succeeds and edit name/description of the channel', async () => {
    const name = 'general-updated'
    const description = 'general-description'
    const channel1 = { name: 'general1', description: 'testing' }
    const result = await createChannel([channel1])
    const channelToEdit = result.channels[0]
    const response = await request(app)
      .put(`/channels/${channelToEdit.id as string}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ name, description })
      .expect(200)
    expect(response.body.channel.name).toEqual(name)
    expect(response.body.channel.description).toEqual(description)
  })

  it('succeeds and set default channel to true', async () => {
    const channel1 = { name: 'general1', description: 'testing' }
    const result = await createChannel([channel1])
    const channelToEdit = result.channels[0]
    const response = await request(app)
      .put(`/channels/${channelToEdit.id as string}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ isDefault: true })
      .expect(200)
    const defaultChannels = await Channel.findAll({
      where: { guildId: result.guild.id, isDefault: true }
    })
    expect(defaultChannels.length).toEqual(1)
    expect(response.body.channel.name).toEqual(channel1.name)
    expect(response.body.channel.isDefault).toBeTruthy()
  })

  it('fails with too long description', async () => {
    const channel1 = { name: 'general1', description: 'testing' }
    const result = await createChannel([channel1])
    const channelToEdit = result.channels[0]
    const response = await request(app)
      .put(`/channels/${channelToEdit.id as string}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ description: randomString(170) })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(
      expect.arrayContaining([
        commonErrorsMessages.charactersLength('description', { max: 160 })
      ])
    )
  })

  it('fails with invalid slug name', async () => {
    const channel1 = { name: 'general1', description: 'testing' }
    const result = await createChannel([channel1])
    const channelToEdit = result.channels[0]
    const response = await request(app)
      .put(`/channels/${channelToEdit.id as string}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ name: 'random channel name' })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Name must be a slug']))
  })

  it('fails with too long name', async () => {
    const channel1 = { name: 'general1', description: 'testing' }
    const result = await createChannel([channel1])
    const channelToEdit = result.channels[0]
    const response = await request(app)
      .put(`/channels/${channelToEdit.id as string}`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ name: ' random channel name ' + randomString(35) })
      .expect(400)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(2)
    expect(errors).toEqual(
      expect.arrayContaining([
        commonErrorsMessages.charactersLength('name', { max: 30, min: 3 }),
        errorsMessages.name.mustBeSlug
      ])
    )
  })

  it("fails if the channel doesn't exist", async () => {
    const userToken = await authenticateUserTest()
    const response = await request(app)
      .put('/channels/23')
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
      .put(`/channels/${channelToRemove.id as string}`)
      .set('Authorization', `${userToken.type} ${userToken.accessToken}`)
      .send()
      .expect(404)
    const errors = formatErrors(response.body.errors)
    expect(errors.length).toEqual(1)
    expect(errors).toEqual(expect.arrayContaining(['Not Found']))
  })
})
