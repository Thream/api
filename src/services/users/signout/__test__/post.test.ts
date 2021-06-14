import { application } from '../../../../application'
import { refreshTokenExample } from '../../../../models/RefreshToken'
import { prismaMock } from '../../../../__test__/setup'

describe('POST /users/signout', () => {
  it('should succeeds', async () => {
    prismaMock.refreshToken.findFirst.mockResolvedValue(refreshTokenExample)
    const response = await application.inject({
      method: 'POST',
      url: '/users/signout',
      payload: { refreshToken: refreshTokenExample.token }
    })
    expect(response.statusCode).toEqual(200)
  })

  it('should fails with invalid refreshToken', async () => {
    prismaMock.refreshToken.findFirst.mockResolvedValue(null)
    const response = await application.inject({
      method: 'POST',
      url: '/users/signout',
      payload: { refreshToken: 'somerandomtoken' }
    })
    expect(response.statusCode).toEqual(404)
  })
})
