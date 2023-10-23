import test from "node:test"
import assert from "node:assert/strict"

import sinon from "sinon"

import { application } from "#src/application.js"
import prisma from "#src/tools/database/prisma.js"
import { userExample } from "#src/models/User.js"
import { userSettingsExample } from "#src/models/UserSettings.js"
import { emailTransporter } from "#src/tools/email/emailTransporter.js"

const payload = {
  name: userExample.name,
  email: userExample.email,
  password: userExample.password,
  theme: userSettingsExample.theme,
  language: userSettingsExample.language,
}

await test("POST /users/signup", async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test("succeeds", async () => {
    sinon.stub(prisma, "user").value({
      findFirst: async () => {
        return null
      },
      create: async () => {
        return userExample
      },
    })
    sinon.stub(prisma, "userSetting").value({
      create: async () => {
        return userSettingsExample
      },
    })
    sinon.stub(emailTransporter, "sendMail").value(() => {})
    const response = await application.inject({
      method: "POST",
      url: "/users/signup",
      payload,
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 201)
    assert.strictEqual(responseJson.user.name, userExample.name)
    assert.strictEqual(responseJson.user.email, userExample.email)
  })

  await t.test("fails with invalid email", async () => {
    sinon.stub(prisma, "user").value({
      findFirst: async () => {
        return null
      },
    })
    sinon.stub(emailTransporter, "sendMail").value(() => {})
    const response = await application.inject({
      method: "POST",
      url: "/users/signup",
      payload: {
        ...payload,
        email: "incorrect-email@abc",
      },
    })
    assert.strictEqual(response.statusCode, 400)
  })

  await t.test("fails with already taken `name` or `email`", async () => {
    sinon.stub(prisma, "user").value({
      findFirst: async () => {
        return userExample
      },
    })
    sinon.stub(emailTransporter, "sendMail").value(() => {})
    const response = await application.inject({
      method: "POST",
      url: "/users/signup",
      payload,
    })
    assert.strictEqual(response.statusCode, 400)
  })
})
