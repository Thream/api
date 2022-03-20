import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../tools/database/prisma.js'
import { messageExample } from '../../../../models/Message.js'
import { memberExample } from '../../../../models/Member.js'
import { userExample } from '../../../../models/User.js'
import { channelExample } from '../../../../models/Channel.js'

await tap.test('PUT /messsages/[messageId]', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    const { accessToken } = await authenticateUserTest()
    const newValue = 'some message'
    sinon.stub(prisma, 'message').value({
      findFirst: async () => {
        return {
          ...messageExample,
          channel: channelExample
        }
      },
      update: async () => {
        return {
          ...messageExample,
          value: newValue
        }
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
      method: 'PUT',
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: { value: newValue }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseJson.id, messageExample.id)
    t.equal(responseJson.value, newValue)
    t.equal(responseJson.type, messageExample.type)
    t.equal(responseJson.mimetype, messageExample.mimetype)
    t.equal(responseJson.member.id, memberExample.id)
    t.equal(responseJson.member.isOwner, memberExample.isOwner)
    t.equal(responseJson.member.user.id, userExample.id)
    t.equal(responseJson.member.user.name, userExample.name)
  })

  await t.test('fails if the message is not found', async (t) => {
    const { accessToken } = await authenticateUserTest()
    const newValue = 'some message'
    sinon.stub(prisma, 'message').value({
      findFirst: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'PUT',
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: { value: newValue }
    })
    t.equal(response.statusCode, 404)
  })

  await t.test('fails if the member is not found', async (t) => {
    const { accessToken } = await authenticateUserTest()
    const newValue = 'some message'
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
      method: 'PUT',
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: { value: newValue }
    })
    t.equal(response.statusCode, 404)
  })

  await t.test(
    'fails if the member is not the owner of the message',
    async (t) => {
      const { accessToken } = await authenticateUserTest()
      const newValue = 'some message'
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
        method: 'PUT',
        url: `/messages/${messageExample.id}`,
        headers: {
          authorization: `Bearer ${accessToken}`
        },
        payload: { value: newValue }
      })
      t.equal(response.statusCode, 400)
    }
  )
})
