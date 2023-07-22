import test from 'node:test'
import assert from 'node:assert/strict'

import sinon from 'sinon'
import ms from 'ms'

import { application } from '#src/application.js'
import prisma from '#src/tools/database/prisma.js'
import { userExample } from '#src/models/User.js'
import { userSettingsExample } from '#src/models/UserSettings.js'
import { emailTransporter } from '#src/tools/email/emailTransporter.js'

await test('POST /users/reset-password', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async () => {
    sinon.stub(prisma, 'user').value({
      findUnique: async () => {
        return userExample
      },
      update: async () => {
        return {
          ...userExample,
          temporaryExpirationToken: new Date(Date.now() + ms('1 hour')),
          temporaryToken: 'random-token'
        }
      }
    })
    sinon.stub(prisma, 'userSetting').value({
      findFirst: async () => {
        return userSettingsExample
      }
    })
    sinon.stub(emailTransporter, 'sendMail').value(() => {})
    const response = await application.inject({
      method: 'POST',
      url: '/users/reset-password?redirectURI=https://redirecturi.com',
      payload: { email: userExample.email }
    })
    assert.strictEqual(response.statusCode, 200)
  })

  await t.test("fails with email that doesn't exist", async () => {
    sinon.stub(prisma, 'user').value({
      findUnique: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/reset-password?redirectURI=https://redirecturi.com',
      payload: { email: userExample.email }
    })
    assert.strictEqual(response.statusCode, 400)
  })

  await t.test('fails with unconfirmed account', async () => {
    sinon.stub(prisma, 'user').value({
      findUnique: async () => {
        return {
          ...userExample,
          isConfirmed: false
        }
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/reset-password?redirectURI=https://redirecturi.com',
      payload: { email: userExample.email }
    })
    assert.strictEqual(response.statusCode, 400)
  })

  await t.test("fails if userSettings doesn't exist", async () => {
    sinon.stub(prisma, 'user').value({
      findUnique: async () => {
        return userExample
      }
    })
    sinon.stub(prisma, 'userSetting').value({
      findFirst: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/reset-password?redirectURI=https://redirecturi.com',
      payload: { email: userExample.email }
    })
    assert.strictEqual(response.statusCode, 400)
  })

  await t.test('fails with a request already in progress', async () => {
    sinon.stub(prisma, 'user').value({
      findUnique: async () => {
        return {
          ...userExample,
          temporaryToken: 'random-token',
          temporaryExpirationToken: new Date(Date.now() + ms('1 hour'))
        }
      }
    })
    sinon.stub(prisma, 'userSetting').value({
      findFirst: async () => {
        return userSettingsExample
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/reset-password?redirectURI=https://redirecturi.com',
      payload: { email: userExample.email }
    })
    assert.strictEqual(response.statusCode, 400)
  })
})
