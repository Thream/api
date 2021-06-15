import { application } from '../../../../application'
import { prismaMock } from '../../../../__test__/setup'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest'

describe('DELETE /users/signout', () => {
  it('should succeeds', async () => {
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

  it('should fails with empty authorization header', async () => {
    const response = await application.inject({
      method: 'DELETE',
      url: '/users/signout'
    })
    expect(response.statusCode).toEqual(401)
  })
})
