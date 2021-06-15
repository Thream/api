import ms from 'ms'
import { application } from '../../../../application'
import { userExample } from '../../../../models/User'
import { prismaMock } from '../../../../__test__/setup'

describe('PUT /users/reset-password', () => {
  it('should succeeds', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      ...userExample,
      temporaryExpirationToken: new Date(Date.now() + ms('1 hour'))
    })
    const response = await application.inject({
      method: 'PUT',
      url: '/users/reset-password',
      payload: {
        password: 'new password',
        temporaryToken: userExample.temporaryToken
      }
    })
    expect(response.statusCode).toEqual(200)
  })

  it('should fails with expired temporaryToken', async () => {
    prismaMock.user.findFirst.mockResolvedValue(userExample)
    const response = await application.inject({
      method: 'PUT',
      url: '/users/reset-password',
      payload: {
        password: 'new password',
        temporaryToken: userExample.temporaryToken
      }
    })
    expect(response.statusCode).toEqual(400)
  })
})
