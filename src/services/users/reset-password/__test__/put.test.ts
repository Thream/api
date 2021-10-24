import ms from 'ms'

import { application } from '../../../../application.js'
import { userExample } from '../../../../models/User.js'
import { prismaMock } from '../../../../__test__/setup.js'

describe('PUT /users/reset-password', () => {
  it('succeeds', async () => {
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

  it('fails with expired temporaryToken', async () => {
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
