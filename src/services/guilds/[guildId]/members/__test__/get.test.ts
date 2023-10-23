import test from "node:test"
import assert from "node:assert/strict"

import sinon from "sinon"

import { application } from "#src/application.js"
import { authenticateUserTest } from "#src/__test__/utils/authenticateUserTest.js"
import prisma from "#src/tools/database/prisma.js"
import { memberExample } from "#src/models/Member.js"
import { guildExample } from "#src/models/Guild.js"
import { userExample } from "#src/models/User.js"

await test("GET /guilds/[guildId]/members", async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test("succeeds", async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return memberExample
      },
      findMany: async () => {
        return [{ ...memberExample, user: userExample }]
      },
    })
    const response = await application.inject({
      method: "GET",
      url: `/guilds/${guildExample.id}/members`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.length, 1)
    assert.strictEqual(responseJson[0].id, memberExample.id)
    assert.strictEqual(responseJson[0].isOwner, memberExample.isOwner)
    assert.strictEqual(responseJson[0].user.id, userExample.id)
    assert.strictEqual(responseJson[0].user.name, userExample.name)
    assert.strictEqual(responseJson[0].user.email, null)
  })

  await t.test("fails with not found member/guild", async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return null
      },
    })
    const response = await application.inject({
      method: "GET",
      url: "/guilds/1/members",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 404)
    assert.strictEqual(responseJson.message, "Member not found")
  })

  await t.test("fails with unauthenticated user", async () => {
    const response = await application.inject({
      method: "GET",
      url: "/guilds/1/members",
    })
    assert.strictEqual(response.statusCode, 401)
  })
})
