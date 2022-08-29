import tap from 'tap'
import sinon from 'sinon'
import jwt from 'jsonwebtoken'

import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../tools/database/prisma.js'
import { refreshTokenExample } from '../../../../models/RefreshToken.js'
import { expiresIn } from '../../../../tools/utils/jwtToken.js'

await tap.test('POST /users/refresh-token', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    const { refreshToken, refreshTokenStubValue } = await authenticateUserTest()
    sinon.stub(prisma, 'refreshToken').value({
      ...refreshTokenStubValue,
      findFirst: async () => {
        return {
          ...refreshTokenExample,
          id: 1,
          token: refreshToken
        }
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/refresh-token',
      payload: { refreshToken }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseJson.type, 'Bearer')
    t.equal(responseJson.expiresIn, expiresIn)
    t.type(responseJson.accessToken, 'string')
  })

  await t.test('fails with refreshToken not saved in database', async (t) => {
    sinon.stub(prisma, 'refreshToken').value({
      findFirst: async () => {
        return null
      }
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/refresh-token',
      payload: { refreshToken: 'somerandomtoken' }
    })
    t.equal(response.statusCode, 403)
  })

  await t.test('fails with invalid jwt refreshToken', async (t) => {
    const { refreshToken, refreshTokenStubValue } = await authenticateUserTest()
    sinon.stub(prisma, 'refreshToken').value({
      ...refreshTokenStubValue,
      findFirst: async () => {
        return refreshTokenExample
      }
    })
    sinon.stub(jwt, 'verify').value(() => {
      throw new Error('Invalid token')
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/refresh-token',
      payload: { refreshToken }
    })
    t.equal(response.statusCode, 403)
  })
})
