import tap from 'tap'
import sinon from 'sinon'
import jwt from 'jsonwebtoken'

import { application } from '../../../../application.js'
import prisma from '../../../../tools/database/prisma.js'
import { refreshTokenExample } from '../../../../models/RefreshToken.js'
import { UserRefreshJWT } from '../../../../models/User.js'

await tap.test('POST /users/signout', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    sinon.stub(prisma, 'refreshToken').value({
      findFirst: async () => {
        return refreshTokenExample
      },
      delete: async () => {}
    })
    sinon.stub(jwt, 'verify').value(() => {
      const value: UserRefreshJWT = {
        id: 1,
        tokenUUID: refreshTokenExample.token,
        currentStrategy: 'Local'
      }
      return value
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/signout',
      payload: { refreshToken: 'jwt token' }
    })
    t.equal(response.statusCode, 200)
  })

  await t.test('fails with invalid refreshToken', async (t) => {
    sinon.stub(prisma, 'refreshToken').value({
      findFirst: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/signout',
      payload: { refreshToken: 'somerandomtoken' }
    })
    t.equal(response.statusCode, 404)
  })
})
