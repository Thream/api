import test from 'node:test'
import assert from 'node:assert/strict'

import sinon from 'sinon'
import ms from 'ms'

import { application } from '#src/application.js'
import prisma from '#src/tools/database/prisma.js'
import { userExample } from '#src/models/User.js'

await test('PUT /users/reset-password', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async () => {
    const temporaryToken = 'random-token'
    sinon.stub(prisma, 'user').value({
      findFirst: async () => {
        return {
          ...userExample,
          temporaryToken,
          temporaryExpirationToken: new Date(Date.now() + ms('1 hour'))
        }
      },
      update: async () => {
        return userExample
      }
    })
    sinon.stub(prisma, 'refreshToken').value({
      deleteMany: async () => {
        return { count: 1 }
      }
    })
    const response = await application.inject({
      method: 'PUT',
      url: '/users/reset-password',
      payload: {
        password: 'new password',
        temporaryToken: userExample.temporaryToken
      }
    })
    assert.strictEqual(response.statusCode, 200)
  })

  await t.test('fails with expired temporaryToken', async () => {
    const temporaryToken = 'random-token'
    sinon.stub(prisma, 'user').value({
      findFirst: async () => {
        return {
          ...userExample,
          temporaryToken,
          temporaryExpirationToken: new Date(Date.now() - ms('1 hour'))
        }
      },
      update: async () => {
        return userExample
      }
    })
    const response = await application.inject({
      method: 'PUT',
      url: '/users/reset-password',
      payload: {
        password: 'new password',
        temporaryToken: userExample.temporaryToken
      }
    })
    assert.strictEqual(response.statusCode, 400)
  })
})
