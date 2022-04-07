import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'

await tap.test('GET /users/current', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test('succeeds', async (t) => {
    const { accessToken, user } = await authenticateUserTest()
    const response = await application.inject({
      method: 'GET',
      url: '/users/current',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    t.equal(response.statusCode, 200)
    t.equal(responseJson.user.name, user.name)
    t.strictSame(responseJson.user.strategies, ['Local'])
  })

  await t.test('fails with unauthenticated user', async (t) => {
    const response = await application.inject({
      method: 'GET',
      url: '/users/current'
    })
    t.equal(response.statusCode, 401)
  })
})
