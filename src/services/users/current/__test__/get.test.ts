import { application } from '../../../../application.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'

describe('GET /users/current', () => {
  it('succeeds', async () => {
    const { accessToken, user } = await authenticateUserTest()
    const response = await application.inject({
      method: 'GET',
      url: '/users/current',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.user.name).toEqual(user.name)
    expect(responseJson.user.strategies).toEqual(
      expect.arrayContaining(['local'])
    )
  })

  it('fails with unauthenticated user', async () => {
    const response = await application.inject({
      method: 'GET',
      url: '/users/current'
    })
    expect(response.statusCode).toEqual(401)
  })
})
