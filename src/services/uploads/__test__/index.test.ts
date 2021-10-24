import request from 'supertest'
import fsMock from 'mock-fs'

import application from '../../../application'
import Message from '../../../models/Message'
import { messagesFilePath } from '../../../tools/configurations/constants'
import { createGuild } from '../../guilds/__test__/utils/createGuild'

describe('GET /uploads', () => {
  it('succeeds and get the file', async () => {
    const name = 'guild'
    const description = 'testing'
    const result = await createGuild({
      guild: { description, name },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const messageFileURL = `${messagesFilePath.name}/logo.png`
    await Message.create({
      value: messageFileURL,
      type: 'file',
      memberId: 1,
      channelId: 1
    })
    fsMock({
      [messagesFilePath.filePath]: {
        'logo.png': ''
      }
    })
    await request(application)
      .get(messageFileURL)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send()
      .expect(200)
  })

  it("fails if the message doesn't exist", async () => {
    const name = 'guild'
    const description = 'testing'
    const result = await createGuild({
      guild: { description, name },
      user: {
        email: 'test@test.com',
        name: 'Test'
      }
    })
    const messageFileURL = `${messagesFilePath.name}/logo.png`
    fsMock({
      [messagesFilePath.filePath]: {
        'logo.png': ''
      }
    })
    await request(application)
      .get(messageFileURL)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send()
      .expect(404)
  })
})
