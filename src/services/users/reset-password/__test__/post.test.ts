import tap from 'tap'
import sinon from 'sinon'
import ms from 'ms'

import { application } from '../../../../application.js'
import prisma from '../../../../tools/database/prisma.js'
import { userExample } from '../../../../models/User.js'
import { userSettingsExample } from '../../../../models/UserSettings.js'
import { emailTransporter } from '../../../../tools/email/emailTransporter.js'

await tap.test('POST /users/reset-password', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
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
    t.equal(response.statusCode, 200)
  })

  await t.test("fails with email that doesn't exist", async (t) => {
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
    t.equal(response.statusCode, 400)
  })

  await t.test('fails with unconfirmed account', async (t) => {
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
    t.equal(response.statusCode, 400)
  })

  await t.test("fails if userSettings doesn't exist", async (t) => {
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
    t.equal(response.statusCode, 400)
  })

  await t.test('fails with a request already in progress', async (t) => {
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
    t.equal(response.statusCode, 400)
  })
})
