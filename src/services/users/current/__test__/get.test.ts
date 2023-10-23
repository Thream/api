import test from "node:test"
import assert from "node:assert/strict"

import sinon from "sinon"

import { application } from "#src/application.js"
import { authenticateUserTest } from "#src/__test__/utils/authenticateUserTest.js"

await test("GET /users/current", async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test("succeeds", async () => {
    const { accessToken, user } = await authenticateUserTest()
    const response = await application.inject({
      method: "GET",
      url: "/users/current",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.user.name, user.name)
    assert.deepStrictEqual(responseJson.user.strategies, ["Local"])
  })

  await t.test("fails with unauthenticated user", async () => {
    const response = await application.inject({
      method: "GET",
      url: "/users/current",
    })
    assert.strictEqual(response.statusCode, 401)
  })
})
