import { application } from '../../../../application.js'
import { prismaMock } from '../../../../__test__/setup.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'

describe('DELETE /users/signout', () => {
  it('succeeds', async () => {
    prismaMock.refreshToken.deleteMany.mockResolvedValue({
      count: 1
    })
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'DELETE',
      url: '/users/signout',
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    })
    expect(response.statusCode).toEqual(200)
  })

  it('fails with empty authorization header', async () => {
    const response = await application.inject({
      method: 'DELETE',
      url: '/users/signout'
    })
    expect(response.statusCode).toEqual(401)
  })
})
