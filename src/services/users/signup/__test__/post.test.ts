import { application } from '../../../../application.js'
import { userExample } from '../../../../models/User.js'
import { userSettingsExample } from '../../../../models/UserSettings.js'
import { prismaMock } from '../../../../__test__/setup.js'

const payload = {
  name: userExample.name,
  email: userExample.email,
  password: userExample.password,
  theme: userSettingsExample.theme,
  language: userSettingsExample.language
}

describe('POST /users/signup', () => {
  it('succeeds', async () => {
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
    expect(responseJson.user.name).toEqual(userExample.name)
    expect(responseJson.user.email).toEqual(userExample.email)
  })

  it('fails with invalid email', async () => {
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

  it('fails with already taken `name` or `email`', async () => {
    prismaMock.user.findFirst.mockResolvedValue(userExample)
    const response = await application.inject({
      method: 'POST',
      url: '/users/signup',
      payload
    })
    expect(response.statusCode).toEqual(400)
  })
})
