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

await test('GET /channels/[channelId]/messages', async (t) => {
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
      findMany: async () => {
        return [messageExample]
      }
    })
    const response = await application.inject({
      method: 'GET',
      url: `/channels/${channelExample.id}/messages`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.length, 1)
    assert.strictEqual(responseJson[0].id, messageExample.id)
    assert.strictEqual(responseJson[0].value, messageExample.value)
    assert.strictEqual(responseJson[0].type, messageExample.type)
    assert.strictEqual(responseJson[0].mimetype, messageExample.mimetype)
    assert.strictEqual(responseJson[0].member.id, memberExample.id)
    assert.strictEqual(responseJson[0].member.isOwner, memberExample.isOwner)
    assert.strictEqual(responseJson[0].member.user.id, userExample.id)
    assert.strictEqual(responseJson[0].member.user.name, userExample.name)
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
      method: 'GET',
      url: `/channels/${channelExample.id}/messages`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
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
      method: 'GET',
      url: `/channels/${channelExample.id}/messages`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 404)
    assert.strictEqual(responseJson.message, 'Channel not found')
  })

  await t.test('fails with unauthenticated user', async () => {
    const response = await application.inject({
      method: 'GET',
      url: `/channels/1/messages`
    })
    assert.strictEqual(response.statusCode, 401)
  })
})
