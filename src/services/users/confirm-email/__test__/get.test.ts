import test from "node:test"
import assert from "node:assert/strict"

import sinon from "sinon"

import { application } from "#src/application.js"
import prisma from "#src/tools/database/prisma.js"
import { userExample } from "#src/models/User.js"

await test("GET /users/confirm-email", async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test("succeeds", async () => {
    sinon.stub(prisma, "user").value({
      findFirst: async () => {
        return userExample
      },
      update: async () => {
        return { ...userExample, isConfirmed: true, temporaryToken: null }
      },
    })
    const response = await application.inject({
      method: "GET",
      url: "/users/confirm-email",
      query: {
        temporaryToken: userExample.temporaryToken ?? "",
      },
    })
    assert.strictEqual(response.statusCode, 200)
  })

  await t.test("should fails with invalid `temporaryToken`", async () => {
    sinon.stub(prisma, "user").value({
      findFirst: async () => {
        return null
      },
      update: async () => {
        return { ...userExample, isConfirmed: true, temporaryToken: null }
      },
    })
    const response = await application.inject({
      method: "GET",
      url: "/users/confirm-email",
      query: {
        temporaryToken: userExample.temporaryToken ?? "",
      },
    })
    assert.strictEqual(response.statusCode, 403)
  })
})
