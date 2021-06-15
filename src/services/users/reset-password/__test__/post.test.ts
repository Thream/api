import ms from 'ms'

import { application } from '../../../../application'
import { userExample } from '../../../../models/User'
import { userSettingsExample } from '../../../../models/UserSettings'
import { prismaMock } from '../../../../__test__/setup'

describe('POST /users/reset-password', () => {
  it('should succeeds', async () => {
    prismaMock.user.findUnique.mockResolvedValue(userExample)
    prismaMock.userSetting.findFirst.mockResolvedValue(userSettingsExample)
    const response = await application.inject({
      method: 'POST',
      url: '/users/reset-password?redirectURI=https://redirecturi.com',
      payload: { email: userExample.email }
    })
    expect(response.statusCode).toEqual(200)
  })

  it("should fails with email that doesn't exist", async () => {
    const response = await application.inject({
      method: 'POST',
      url: '/users/reset-password?redirectURI=https://redirecturi.com',
      payload: { email: userExample.email }
    })
    expect(response.statusCode).toEqual(400)
  })

  it('should fails with unconfirmed account', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...userExample,
      isConfirmed: false
    })
    const response = await application.inject({
      method: 'POST',
      url: '/users/reset-password?redirectURI=https://redirecturi.com',
      payload: { email: userExample.email }
    })
    expect(response.statusCode).toEqual(400)
  })

  it("should fails if userSettings doenst' exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(userExample)
    prismaMock.userSetting.findFirst.mockResolvedValue(null)
    const response = await application.inject({
      method: 'POST',
      url: '/users/reset-password?redirectURI=https://redirecturi.com',
      payload: { email: userExample.email }
    })
    expect(response.statusCode).toEqual(400)
  })

  it('should fails with a request already in progress', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...userExample,
      temporaryExpirationToken: new Date(Date.now() + ms('1 hour'))
    })
    prismaMock.userSetting.findFirst.mockResolvedValue(userSettingsExample)
    const response = await application.inject({
      method: 'POST',
      url: '/users/reset-password?redirectURI=https://redirecturi.com',
      payload: { email: userExample.email }
    })
    expect(response.statusCode).toEqual(400)
  })
})
