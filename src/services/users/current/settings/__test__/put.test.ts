import tap from 'tap'
import sinon from 'sinon'

import { application } from '../../../../../application.js'
import { authenticateUserTest } from '../../../../../__test__/utils/authenticateUserTest.js'
import prisma from '../../../../../tools/database/prisma.js'
import { userSettingsExample } from '../../../../../models/UserSettings.js'

await tap.test('PUT /users/current/settings', async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test(
    'succeeds and edit the theme, language, isPublicEmail and isPublicGuilds',
    async (t) => {
      const newSettings = {
        theme: 'light',
        language: 'fr',
        isPublicEmail: true,
        isPublicGuilds: true
      }
      const { accessToken, userSettingStubValue } = await authenticateUserTest()
      sinon.stub(prisma, 'userSetting').value({
        ...userSettingStubValue,
        findFirst: async () => {
          return userSettingsExample
        },
        update: async () => {
          return {
            ...userSettingsExample,
            ...newSettings
          }
        }
      })
      const response = await application.inject({
        method: 'PUT',
        url: '/users/current/settings',
        headers: {
          authorization: `Bearer ${accessToken}`
        },
        payload: newSettings
      })
      const responseJson = response.json()
      t.equal(response.statusCode, 200)
      t.equal(responseJson.settings.theme, newSettings.theme)
      t.equal(responseJson.settings.language, newSettings.language)
      t.equal(responseJson.settings.isPublicEmail, newSettings.isPublicEmail)
      t.equal(responseJson.settings.isPublicGuilds, newSettings.isPublicGuilds)
    }
  )

  await t.test('fails with invalid language', async (t) => {
    const newSettings = {
      language: 'somerandomlanguage'
    }
    const { accessToken, userSettingStubValue } = await authenticateUserTest()
    sinon.stub(prisma, 'userSetting').value({
      ...userSettingStubValue,
      findFirst: async () => {
        return userSettingsExample
      },
      update: async () => {
        return {
          ...userSettingsExample,
          ...newSettings
        }
      }
    })
    const response = await application.inject({
      method: 'PUT',
      url: '/users/current/settings',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: newSettings
    })
    t.equal(response.statusCode, 400)
  })
})
