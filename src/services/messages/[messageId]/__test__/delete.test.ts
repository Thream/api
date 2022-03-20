import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../tools/database/prisma.js'
import { messageExample } from '../../../../models/Message.js'
import { memberExample } from '../../../../models/Member.js'
import { userExample } from '../../../../models/User.js'
import { channelExample } from '../../../../models/Channel.js'

await tap.test('DELETE /messsages/[messageId]', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'message').value({
      findFirst: async () => {
        return {
          ...messageExample,
          channel: channelExample
        }
      },
      delete: async () => {
        return messageExample
      }
    })
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return {
          ...memberExample,
          user: userExample
        }
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseJson.id, messageExample.id)
    t.equal(responseJson.value, messageExample.value)
    t.equal(responseJson.type, messageExample.type)
    t.equal(responseJson.mimetype, messageExample.mimetype)
    t.equal(responseJson.member.id, memberExample.id)
    t.equal(responseJson.member.isOwner, memberExample.isOwner)
    t.equal(responseJson.member.user.id, userExample.id)
    t.equal(responseJson.member.user.name, userExample.name)
  })

  await t.test('fails if the message is not found', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'message').value({
      findFirst: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    t.equal(response.statusCode, 404)
  })

  await t.test('fails if the member is not found', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'message').value({
      findFirst: async () => {
        return {
          ...messageExample,
          channel: channelExample
        }
      }
    })
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    t.equal(response.statusCode, 404)
  })

  await t.test('fails if the member is not owner of the message', async (t) => {
    const { accessToken } = await authenticateUserTest()
    const randomUserIdOwnerOfMessage = 14
    sinon.stub(prisma, 'message').value({
      findFirst: async () => {
        return {
          ...messageExample,
          channel: channelExample
        }
      }
    })
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return {
          ...memberExample,
          userId: randomUserIdOwnerOfMessage
        }
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    t.equal(response.statusCode, 400)
  })
})
