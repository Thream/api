import test from 'node:test'
import assert from 'node:assert/strict'

import sinon from 'sinon'

import { application } from '#src/application.js'
import { authenticateUserTest } from '#src/__test__/utils/authenticateUserTest.js'
import prisma from '#src/tools/database/prisma.js'
import { memberExample } from '#src/models/Member.js'
import { guildExample } from '#src/models/Guild.js'
import { channelExample } from '#src/models/Channel.js'
import { userExample } from '#src/models/User.js'

await test('POST /guilds', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async () => {
    const { accessToken, user } = await authenticateUserTest()
    sinon.stub(prisma, 'guild').value({
      create: async () => {
        return guildExample
      }
    })
    sinon.stub(prisma, 'member').value({
      create: async () => {
        return memberExample
      },
      findUnique: async () => {
        return {
          ...memberExample,
          ...userExample
        }
      }
    })
    sinon.stub(prisma, 'channel').value({
      create: async () => {
        return channelExample
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: '/guilds',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: guildExample.name,
        description: guildExample.description
      }
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 201)
    assert.strictEqual(responseJson.guild.id, guildExample.id)
    assert.strictEqual(responseJson.guild.name, guildExample.name)
    assert.strictEqual(responseJson.guild.description, guildExample.description)
    assert.strictEqual(responseJson.guild.members.length, 1)
    assert.strictEqual(responseJson.guild.members[0].userId, user.id)
    assert.strictEqual(responseJson.guild.members[0].user.name, user.name)
    assert.strictEqual(responseJson.guild.members[0].guildId, guildExample.id)
    assert.strictEqual(
      responseJson.guild.members[0].isOwner,
      memberExample.isOwner
    )
    assert.strictEqual(responseJson.guild.channels.length, 1)
    assert.strictEqual(responseJson.guild.channels[0].id, channelExample.id)
    assert.strictEqual(responseJson.guild.channels[0].guildId, guildExample.id)
  })

  await t.test('fails with empty name and description', async () => {
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'POST',
      url: '/guilds',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    assert.strictEqual(response.statusCode, 400)
  })
})
