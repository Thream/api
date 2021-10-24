import { application } from '../../../../application.js'
import { refreshTokenExample } from '../../../../models/RefreshToken.js'
import { expiresIn } from '../../../../tools/utils/jwtToken.js'
import { prismaMock } from '../../../../__test__/setup.js'
import { authenticateUserTest } from '../../../../__test__/utils/authenticateUserTest.js'

describe('POST /users/refresh-token', () => {
  it('succeeds', async () => {
    const { refreshToken } = await authenticateUserTest()
    prismaMock.refreshToken.findFirst.mockResolvedValue({
      ...refreshTokenExample,
      id: 1,
      token: refreshToken
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/refresh-token',
      payload: { refreshToken }
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.type).toEqual('Bearer')
    expect(responseJson.expiresIn).toEqual(expiresIn)
    expect(typeof responseJson.accessToken).toEqual('string')
  })

  it('fails with refreshToken noty saved in database', async () => {
    const response = await application.inject({
      method: 'POST',
      url: '/users/refresh-token',
      payload: { refreshToken: 'somerandomtoken' }
    })
    expect(response.statusCode).toEqual(403)
  })

  it('fails with invalid jwt refreshToken', async () => {
    const { refreshToken } = await authenticateUserTest()
    prismaMock.refreshToken.findFirst.mockResolvedValue(refreshTokenExample)
    const response = await application.inject({
      method: 'POST',
      url: '/users/refresh-token',
      payload: { refreshToken }
    })
    expect(response.statusCode).toEqual(403)
  })
})
