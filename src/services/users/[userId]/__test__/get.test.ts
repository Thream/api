import test from 'node:test'
import assert from 'node:assert/strict'

import sinon from 'sinon'

import { application } from '#src/application.js'
import prisma from '#src/tools/database/prisma.js'
import { userExample } from '#src/models/User.js'
import { userSettingsExample } from '#src/models/UserSettings.js'

await test('GET /users/[userId]', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async () => {
    sinon.stub(prisma, 'guild').value({
      findMany: async () => {
        return []
      }
    })
    sinon.stub(prisma, 'user').value({
      findUnique: async () => {
        return userExample
      }
    })
    sinon.stub(prisma, 'userSetting').value({
      findFirst: async () => {
        return userSettingsExample
      }
    })
    const response = await application.inject({
      method: 'GET',
      url: `/users/${userExample.id}`
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.user.id, userExample.id)
    assert.strictEqual(responseJson.user.name, userExample.name)
  })

  await t.test('fails with not found user', async () => {
    sinon.stub(prisma, 'userSetting').value({
      findFirst: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'GET',
      url: `/users/1`
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 404)
    assert.strictEqual(responseJson.message, 'User not found')
  })
})
