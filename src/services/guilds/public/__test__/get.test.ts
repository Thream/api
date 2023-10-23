import test from "node:test"
import assert from "node:assert/strict"

import sinon from "sinon"

import { application } from "#src/application.js"
import { authenticateUserTest } from "#src/__test__/utils/authenticateUserTest.js"
import prisma from "#src/tools/database/prisma.js"
import { guildExample } from "#src/models/Guild.js"

await test("GET /guilds/public", async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test("succeeds", async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, "guild").value({
      findMany: async () => {
        return [guildExample]
      },
    })
    sinon.stub(prisma, "member").value({
      count: async () => {
        return 2
      },
    })
    const response = await application.inject({
      method: "GET",
      url: "/guilds/public",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.length, 1)
    assert.strictEqual(responseJson[0].name, guildExample.name)
    assert.strictEqual(responseJson[0].membersCount, 2)
  })
})
