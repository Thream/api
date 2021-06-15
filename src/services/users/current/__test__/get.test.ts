import { application } from '../../../../application'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest'

describe('GET /users/current', () => {
  it('should succeeds', async () => {
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

  it('should fails with unauthenticated user', async () => {
    const response = await application.inject({
      method: 'GET',
      url: '/users/current'
    })
    expect(response.statusCode).toEqual(401)
  })
})
