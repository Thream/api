import { application } from '../../../../application'
import { userExample } from '../../../../models/User'
import { userSettingsExample } from '../../../../models/UserSettings'
import { prismaMock } from '../../../../__test__/setup'

const payload = {
  name: userExample.name,
  email: userExample.email,
  password: userExample.password,
  theme: userSettingsExample.theme,
  language: userSettingsExample.language
}

describe('POST /users/signup', () => {
  it('should succeeds', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)
    prismaMock.user.create.mockResolvedValue(userExample)
    prismaMock.userSetting.create.mockResolvedValue(userSettingsExample)
    const response = await application.inject({
      method: 'POST',
      url: '/users/signup',
      payload
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(201)
    expect(responseJson.name).toEqual(userExample.name)
    expect(responseJson.email).toEqual(userExample.email)
  })

  it('should fails with invalid email', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)
    prismaMock.user.create.mockResolvedValue(userExample)
    prismaMock.userSetting.create.mockResolvedValue(userSettingsExample)
    const response = await application.inject({
      method: 'POST',
      url: '/users/signup',
      payload: {
        ...payload,
        email: 'incorrect-email'
      }
    })
    expect(response.statusCode).toEqual(400)
  })

  it('should fails with already taken `name` or `email`', async () => {
    prismaMock.user.findFirst.mockResolvedValue(userExample)
    const response = await application.inject({
      method: 'POST',
      url: '/users/signup',
      payload
    })
    expect(response.statusCode).toEqual(400)
  })
})
