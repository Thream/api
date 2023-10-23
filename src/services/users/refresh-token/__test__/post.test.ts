import test from "node:test"
import assert from "node:assert/strict"

import sinon from "sinon"
import jwt from "jsonwebtoken"

import { application } from "#src/application.js"
import { authenticateUserTest } from "#src/__test__/utils/authenticateUserTest.js"
import prisma from "#src/tools/database/prisma.js"
import { refreshTokenExample } from "#src/models/RefreshToken.js"
import { expiresIn } from "#src/tools/utils/jwtToken.js"

await test("POST /users/refresh-token", async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test("succeeds", async () => {
    const { refreshToken, refreshTokenStubValue } = await authenticateUserTest()
    sinon.stub(prisma, "refreshToken").value({
      ...refreshTokenStubValue,
      findFirst: async () => {
        return {
          ...refreshTokenExample,
          id: 1,
          token: refreshToken,
        }
      },
    })
    const response = await application.inject({
      method: "POST",
      url: "/users/refresh-token",
      payload: { refreshToken },
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.type, "Bearer")
    assert.strictEqual(responseJson.expiresIn, expiresIn)
    assert.strictEqual(typeof responseJson.accessToken, "string")
  })

  await t.test("fails with refreshToken not saved in database", async () => {
    sinon.stub(prisma, "refreshToken").value({
      findFirst: async () => {
        return null
      },
    })
    const response = await application.inject({
      method: "POST",
      url: "/users/refresh-token",
      payload: { refreshToken: "somerandomtoken" },
    })
    assert.strictEqual(response.statusCode, 403)
  })

  await t.test("fails with invalid jwt refreshToken", async () => {
    const { refreshToken, refreshTokenStubValue } = await authenticateUserTest()
    sinon.stub(prisma, "refreshToken").value({
      ...refreshTokenStubValue,
      findFirst: async () => {
        return refreshTokenExample
      },
    })
    sinon.stub(jwt, "verify").value(() => {
      throw new Error("Invalid token")
    })
    const response = await application.inject({
      method: "POST",
      url: "/users/refresh-token",
      payload: { refreshToken },
    })
    assert.strictEqual(response.statusCode, 403)
  })
})
