import { application } from '../../../../application.js'
import { refreshTokenExample } from '../../../../models/RefreshToken.js'
import { prismaMock } from '../../../../__test__/setup.js'

describe('POST /users/signout', () => {
  it('succeeds', async () => {
    prismaMock.refreshToken.findFirst.mockResolvedValue(refreshTokenExample)
    const response = await application.inject({
      method: 'POST',
      url: '/users/signout',
      payload: { refreshToken: refreshTokenExample.token }
    })
    expect(response.statusCode).toEqual(200)
  })

  it('fails with invalid refreshToken', async () => {
    prismaMock.refreshToken.findFirst.mockResolvedValue(null)
    const response = await application.inject({
      method: 'POST',
      url: '/users/signout',
      payload: { refreshToken: 'somerandomtoken' }
    })
    expect(response.statusCode).toEqual(404)
  })
})
