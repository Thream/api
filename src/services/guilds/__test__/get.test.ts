import test from 'node:test'
import assert from 'node:assert/strict'

import sinon from 'sinon'

import { application } from '#src/application.js'
import { authenticateUserTest } from '#src/__test__/utils/authenticateUserTest.js'
import prisma from '#src/tools/database/prisma.js'
import { memberExample } from '#src/models/Member.js'
import { guildExample } from '#src/models/Guild.js'
import { channelExample } from '#src/models/Channel.js'

await test('GET /guilds', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'guild').value({
      findUnique: async () => {
        return guildExample
      }
    })
    sinon.stub(prisma, 'member').value({
      findMany: async () => {
        return [memberExample]
      }
    })
    sinon.stub(prisma, 'channel').value({
      findFirst: async () => {
        return channelExample
      }
    })
    const response = await application.inject({
      method: 'GET',
      url: '/guilds',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.length, 1)
    assert.strictEqual(responseJson[0].name, guildExample.name)
    assert.strictEqual(responseJson[0].description, guildExample.description)
    assert.strictEqual(responseJson[0].defaultChannelId, channelExample.id)
  })
})
