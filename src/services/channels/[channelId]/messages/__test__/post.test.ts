import test from 'node:test'
import assert from 'node:assert/strict'

import sinon from 'sinon'

import { application } from '#src/application.js'
import { authenticateUserTest } from '#src/__test__/utils/authenticateUserTest.js'
import prisma from '#src/tools/database/prisma.js'
import { channelExample } from '#src/models/Channel.js'
import { memberExample } from '#src/models/Member.js'
import { userExample } from '#src/models/User.js'
import { messageExample } from '#src/models/Message.js'

await test('POST /channels/[channelId]/messages', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async () => {
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
    assert.strictEqual(response.statusCode, 201)
    assert.strictEqual(responseJson.id, messageExample.id)
    assert.strictEqual(responseJson.value, messageExample.value)
    assert.strictEqual(responseJson.type, messageExample.type)
    assert.strictEqual(responseJson.mimetype, messageExample.mimetype)
    assert.strictEqual(responseJson.member.id, memberExample.id)
    assert.strictEqual(responseJson.member.isOwner, memberExample.isOwner)
    assert.strictEqual(responseJson.member.user.id, userExample.id)
    assert.strictEqual(responseJson.member.user.name, userExample.name)
  })

  await t.test('fails with no message value', async () => {
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
    assert.strictEqual(response.statusCode, 400)
  })

  await t.test('fails with not found channel', async () => {
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
    assert.strictEqual(response.statusCode, 404)
    assert.strictEqual(responseJson.message, 'Channel not found')
  })

  await t.test('fails with not found member', async () => {
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
    assert.strictEqual(response.statusCode, 404)
    assert.strictEqual(responseJson.message, 'Channel not found')
  })
})
