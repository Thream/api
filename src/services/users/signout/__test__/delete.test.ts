import test from "node:test"
import assert from "node:assert/strict"

import sinon from "sinon"

import { application } from "#src/application.js"
import { authenticateUserTest } from "#src/__test__/utils/authenticateUserTest.js"
import prisma from "#src/tools/database/prisma.js"

await test("DELETE /users/signout", async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test("succeeds", async () => {
    const { accessToken, refreshTokenStubValue } = await authenticateUserTest()
    sinon.stub(prisma, "refreshToken").value({
      ...refreshTokenStubValue,
      deleteMany: async () => {
        return { count: 1 }
      },
    })
    const response = await application.inject({
      method: "DELETE",
      url: "/users/signout",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    assert.strictEqual(response.statusCode, 200)
  })

  await t.test("fails with empty authorized header", async () => {
    const response = await application.inject({
      method: "DELETE",
      url: "/users/signout",
    })
    assert.strictEqual(response.statusCode, 401)
  })
})
