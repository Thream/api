import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../application.js'
import prisma from '../../../../tools/database/prisma.js'
import { userExample } from '../../../../models/User.js'

await tap.test('GET /users/confirm-email', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    sinon.stub(prisma, 'user').value({
      findFirst: async () => {
        return userExample
      },
      update: async () => {
        return { ...userExample, isConfirmed: true, temporaryToken: null }
      }
    })
    const response = await application.inject({
      method: 'GET',
      url: '/users/confirm-email',
      query: {
        temporaryToken: userExample.temporaryToken ?? ''
      }
    })
    t.equal(response.statusCode, 200)
  })

  await t.test('should fails with invalid `temporaryToken`', async (t) => {
    sinon.stub(prisma, 'user').value({
      findFirst: async () => {
        return null
      },
      update: async () => {
        return { ...userExample, isConfirmed: true, temporaryToken: null }
      }
    })
    const response = await application.inject({
      method: 'GET',
      url: '/users/confirm-email',
      query: {
        temporaryToken: userExample.temporaryToken ?? ''
      }
    })
    t.equal(response.statusCode, 403)
  })
})
