import test from 'node:test'
import assert from 'node:assert/strict'

import sinon from 'sinon'

import { application } from '#src/application.js'
import { authenticateUserTest } from '#src/__test__/utils/authenticateUserTest.js'
import prisma from '#src/tools/database/prisma.js'
import { memberExample } from '#src/models/Member.js'
import { guildExample } from '#src/models/Guild.js'
import { channelExample } from '#src/models/Channel.js'

const defaultChannelId = 5
const newName = 'New guild name'
const newDescription = 'New guild description'

await test('PUT /guilds/[guildId]', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds and edit the guild', async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return {
          ...memberExample,
          isOwner: true,
          guild: guildExample
        }
      }
    })
    sinon.stub(prisma, 'channel').value({
      findFirst: async () => {
        return {
          ...channelExample,
          id: defaultChannelId
        }
      }
    })
    sinon.stub(prisma, 'guild').value({
      update: async () => {
        return {
          ...guildExample,
          name: newName,
          description: newDescription
        }
      }
    })
    const response = await application.inject({
      method: 'PUT',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: newName,
        description: newDescription
      }
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.name, newName)
    assert.strictEqual(responseJson.description, newDescription)
    assert.strictEqual(responseJson.defaultChannelId, defaultChannelId)
  })

  await t.test("fails if the guild doesn't exist", async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'PUT',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: newName,
        description: newDescription
      }
    })
    assert.strictEqual(response.statusCode, 404)
  })

  await t.test('fails if the user is not the owner', async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return {
          ...memberExample,
          isOwner: false,
          guild: guildExample
        }
      }
    })
    const response = await application.inject({
      method: 'PUT',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: {
        name: newName,
        description: newDescription
      }
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 400)
    assert.strictEqual(
      responseJson.message,
      'You should be an owner of the guild'
    )
  })
})
