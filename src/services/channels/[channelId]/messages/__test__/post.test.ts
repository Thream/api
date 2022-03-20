import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../../application.js'
import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../../tools/database/prisma.js'
import { channelExample } from '../../../../../models/Channel.js'
import { memberExample } from '../../../../../models/Member.js'
import { userExample } from '../../../../../models/User.js'
import { messageExample } from '../../../../../models/Message.js'

await tap.test('POST /channels/[channelId]/messages', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'channel').value({
      findUnique: async () => {
        return channelExample
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
    sinon.stub(prisma, 'message').value({
      create: async () => {
        return messageExample
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: `/channels/${channelExample.id}/messages`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: { value: messageExample.value }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 201)
    t.equal(responseJson.id, messageExample.id)
    t.equal(responseJson.value, messageExample.value)
    t.equal(responseJson.type, messageExample.type)
    t.equal(responseJson.mimetype, messageExample.mimetype)
    t.equal(responseJson.member.id, memberExample.id)
    t.equal(responseJson.member.isOwner, memberExample.isOwner)
    t.equal(responseJson.member.user.id, userExample.id)
    t.equal(responseJson.member.user.name, userExample.name)
  })

  await t.test('fails with no message value', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'channel').value({
      findUnique: async () => {
        return channelExample
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
      method: 'POST',
      url: `/channels/${channelExample.id}/messages`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {}
    })
    t.equal(response.statusCode, 400)
  })

  await t.test('fails with not found channel', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'channel').value({
      findUnique: async () => {
        return null
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
      method: 'POST',
      url: '/channels/5/messages',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: { value: messageExample.value }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 404)
    t.equal(responseJson.message, 'Channel not found')
  })

  await t.test('fails with not found member', async (t) => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'channel').value({
      findUnique: async () => {
        return channelExample
      }
    })
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: `/channels/${channelExample.id}/messages`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: { value: messageExample.value }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 404)
    t.equal(responseJson.message, 'Channel not found')
  })
})
