import test from 'node:test'
import assert from 'node:assert/strict'

import sinon from 'sinon'

import { application } from '#src/application.js'
import { authenticateUserTest } from '#src/__test__/utils/authenticateUserTest.js'
import prisma from '#src/tools/database/prisma.js'
import { memberExample } from '#src/models/Member.js'
import { guildExample } from '#src/models/Guild.js'

await test('DELETE /guilds/[guildId]', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds and delete the guild', async () => {
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
    sinon.stub(prisma, 'guild').value({
      delete: async () => {
        return guildExample
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.id, guildExample.id)
    assert.strictEqual(responseJson.name, guildExample.name)
    assert.strictEqual(responseJson.description, guildExample.description)
  })

  await t.test("fails if the guild doesn't exist", async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, 'member').value({
      findFirst: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
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
      method: 'DELETE',
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`
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
