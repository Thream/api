import { application } from '../../../../application'
import { userExample } from '../../../../models/User'
import { generateAccessToken } from '../../../../tools/utils/jwtToken'
import { prismaMock } from '../../../../__test__/setup'

describe('DELETE /users/signout', () => {
  it('should succeeds', async () => {
    prismaMock.refreshToken.deleteMany.mockResolvedValue({
      count: 1
    })
    prismaMock.user.findUnique.mockResolvedValue(userExample)
    const accessToken = generateAccessToken({
      currentStrategy: 'local',
      id: 1
    })
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
