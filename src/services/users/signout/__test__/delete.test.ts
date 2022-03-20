import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../tools/database/prisma.js'

await tap.test('DELETE /users/signout', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    const { accessToken, refreshTokenStubValue } = await authenticateUserTest()
    sinon.stub(prisma, 'refreshToken').value({
      ...refreshTokenStubValue,
      deleteMany: async () => {
        return { count: 1 }
      }
    })
    const response = await application.inject({
      method: 'DELETE',
      url: '/users/signout',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    t.equal(response.statusCode, 200)
  })

  await t.test('fails with empty authorized header', async (t) => {
    const response = await application.inject({
      method: 'DELETE',
      url: '/users/signout'
    })
    t.equal(response.statusCode, 401)
  })
})
