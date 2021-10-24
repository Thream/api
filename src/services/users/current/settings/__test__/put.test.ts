import { application } from '../../../../../application.js'
import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUserTest.js'
import { prismaMock } from '../../../../../__test__/setup.js'
import { userSettingsExample } from '../../../../../models/UserSettings.js'

describe('PUT /users/current/settings', () => {
  it('succeeds and edit the theme, language, isPublicEmail and isPublicGuilds', async () => {
    const newSettings = {
      theme: 'light',
      language: 'fr',
      isPublicEmail: true,
      isPublicGuilds: true
    }
    prismaMock.userSetting.findFirst.mockResolvedValue(userSettingsExample)
    prismaMock.userSetting.update.mockResolvedValue({
      ...userSettingsExample,
      ...newSettings
    })
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'PUT',
      url: '/users/current/settings',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: newSettings
    })
    const responseJson = response.json()
    expect(response.statusCode).toEqual(200)
    expect(responseJson.settings.theme).toEqual(newSettings.theme)
    expect(responseJson.settings.language).toEqual(newSettings.language)
    expect(responseJson.settings.isPublicEmail).toEqual(
      newSettings.isPublicEmail
    )
    expect(responseJson.settings.isPublicGuilds).toEqual(
      newSettings.isPublicGuilds
    )
  })

  it('fails with invalid language', async () => {
    const newSettings = {
      language: 'somerandomlanguage'
    }
    prismaMock.userSetting.findFirst.mockResolvedValue(userSettingsExample)
    const { accessToken } = await authenticateUserTest()
    const response = await application.inject({
      method: 'PUT',
      url: '/users/current/settings',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: newSettings
    })
    expect(response.statusCode).toEqual(400)
  })
})
