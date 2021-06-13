import { application } from '../../../../application'
import { userExample } from '../../../../models/User'
import { prismaMock } from '../../../../__test__/setup'

describe('GET /users/confirm-email', () => {
  it('should succeeds', async () => {
    prismaMock.user.findFirst.mockResolvedValue(userExample)
    prismaMock.user.update.mockResolvedValue({
      ...userExample,
      isConfirmed: true,
      temporaryToken: null
    })
    const response = await application.inject({
      method: 'GET',
      url: '/users/confirm-email',
      query: {
        temporaryToken: userExample.temporaryToken ?? ''
      }
    })
    expect(response.statusCode).toEqual(200)
  })

  it('should fails with invalid `temporaryToken`', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)
    prismaMock.user.update.mockResolvedValue({
      ...userExample,
      isConfirmed: true,
      temporaryToken: null
    })
    const response = await application.inject({
      method: 'GET',
      url: '/users/confirm-email',
      query: {
        temporaryToken: userExample.temporaryToken ?? ''
      }
    })
    expect(response.statusCode).toEqual(403)
  })
})
