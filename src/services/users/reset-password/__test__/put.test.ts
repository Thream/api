import tap from 'tap'
import sinon from 'sinon'
import ms from 'ms'

import { application } from '../../../../application.js'
import prisma from '../../../../tools/database/prisma.js'
import { userExample } from '../../../../models/User.js'

await tap.test('PUT /users/reset-password', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
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
    const response = await application.inject({
      method: 'PUT',
      url: '/users/reset-password',
      payload: {
        password: 'new password',
        temporaryToken: userExample.temporaryToken
      }
    })
    t.equal(response.statusCode, 200)
  })

  await t.test('fails with expired temporaryToken', async (t) => {
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
    t.equal(response.statusCode, 400)
  })
})
