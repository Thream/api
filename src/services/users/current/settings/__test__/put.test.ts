import test from "node:test"
import assert from "node:assert/strict"

import sinon from "sinon"

import { application } from "#src/application.js"
import { authenticateUserTest } from "#src/__test__/utils/authenticateUserTest.js"
import prisma from "#src/tools/database/prisma.js"
import { userSettingsExample } from "#src/models/UserSettings.js"

await test("PUT /users/current/settings", async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test(
    "succeeds and edit the theme, language, isPublicEmail and isPublicGuilds",
    async () => {
      const newSettings = {
        theme: "light",
        language: "fr",
        isPublicEmail: true,
        isPublicGuilds: true,
      }
      const { accessToken, userSettingStubValue } = await authenticateUserTest()
      sinon.stub(prisma, "userSetting").value({
        ...userSettingStubValue,
        findFirst: async () => {
          return userSettingsExample
        },
        update: async () => {
          return {
            ...userSettingsExample,
            ...newSettings,
          }
        },
      })
      const response = await application.inject({
        method: "PUT",
        url: "/users/current/settings",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: newSettings,
      })
      const responseJson = response.json()
      assert.strictEqual(response.statusCode, 200)
      assert.strictEqual(responseJson.settings.theme, newSettings.theme)
      assert.strictEqual(responseJson.settings.language, newSettings.language)
      assert.strictEqual(
        responseJson.settings.isPublicEmail,
        newSettings.isPublicEmail,
      )
      assert.strictEqual(
        responseJson.settings.isPublicGuilds,
        newSettings.isPublicGuilds,
      )
    },
  )

  await t.test("fails with invalid language", async () => {
    const newSettings = {
      language: "somerandomlanguage",
    }
    const { accessToken, userSettingStubValue } = await authenticateUserTest()
    sinon.stub(prisma, "userSetting").value({
      ...userSettingStubValue,
      findFirst: async () => {
        return userSettingsExample
      },
      update: async () => {
        return {
          ...userSettingsExample,
          ...newSettings,
        }
      },
    })
    const response = await application.inject({
      method: "PUT",
      url: "/users/current/settings",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: newSettings,
    })
    assert.strictEqual(response.statusCode, 400)
  })
})
