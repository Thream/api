import ms from 'ms'

import { application } from '../../../../application.js'
import { userExample } from '../../../../models/User.js'
import { userSettingsExample } from '../../../../models/UserSettings.js'
import { prismaMock } from '../../../../__test__/setup.js'

describe('POST /users/reset-password', () => {
  it('succeeds', async () => {
    prismaMock.user.findUnique.mockResolvedValue(userExample)
    prismaMock.userSetting.findFirst.mockResolvedValue(userSettingsExample)
    const response = await application.inject({
      method: 'POST',
      url: '/users/reset-password?redirectURI=https://redirecturi.com',
      payload: { email: userExample.email }
    })
    expect(response.statusCode).toEqual(200)
  })

  it("fails with email that doesn't exist", async () => {
    const response = await application.inject({
      method: 'POST',
      url: '/users/reset-password?redirectURI=https://redirecturi.com',
      payload: { email: userExample.email }
    })
    expect(response.statusCode).toEqual(400)
  })

  it('fails with unconfirmed account', async () => {
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

  it("fails if userSettings doenst' exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(userExample)
    prismaMock.userSetting.findFirst.mockResolvedValue(null)
    const response = await application.inject({
      method: 'POST',
      url: '/users/reset-password?redirectURI=https://redirecturi.com',
      payload: { email: userExample.email }
    })
    expect(response.statusCode).toEqual(400)
  })

  it('fails with a request already in progress', async () => {
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
