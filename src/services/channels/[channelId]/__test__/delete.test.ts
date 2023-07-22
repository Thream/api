import test from 'node:test'
import assert from 'node:assert/strict'

import sinon from 'sinon'

import { application } from '#src/application.js'
import { authenticateUserTest } from '#src/__test__/utils/authenticateUserTest.js'
import prisma from '#src/tools/database/prisma.js'
import { channelExample } from '#src/models/Channel.js'
import { memberExample } from '#src/models/Member.js'

await test('DELETE /channels/[channelId]', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async () => {
    const defaultChannelId = 5
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'channel').value({
      findUnique: async () => {
        return channelExample
      },
      findFirst: async () => {
        return {
          ...channelExample,
          id: defaultChannelId
        }
      },
      count: async () => {
        return 2
      },
      delete: async () => {
        return channelExample
      }
    })
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return memberExample
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.id, channelExample.id)
    assert.strictEqual(responseJson.name, channelExample.name)
    assert.strictEqual(responseJson.guildId, channelExample.guildId)
    assert.strictEqual(responseJson.defaultChannelId, defaultChannelId)
  })

  await t.test('fails if there is only one channel', async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'channel').value({
      findUnique: async () => {
        return channelExample
      },
      count: async () => {
        return 1
      }
    })
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return memberExample
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    assert.strictEqual(response.statusCode, 400)
  })

  await t.test('fails if the channel is not found', async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'channel').value({
      findUnique: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    assert.strictEqual(response.statusCode, 404)
  })

  await t.test('fails if the member is not found', async () => {
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
      method: 'DELETE',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    assert.strictEqual(response.statusCode, 404)
  })

  await t.test('fails if the member is not owner', async () => {
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
          isOwner: false
        }
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    assert.strictEqual(response.statusCode, 400)
  })
})
