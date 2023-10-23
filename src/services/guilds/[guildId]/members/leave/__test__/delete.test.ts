import test from "node:test"
import assert from "node:assert/strict"

import sinon from "sinon"

import { application } from "#src/application.js"
import { authenticateUserTest } from "#src/__test__/utils/authenticateUserTest.js"
import prisma from "#src/tools/database/prisma.js"
import { memberExample } from "#src/models/Member.js"
import { guildExample } from "#src/models/Guild.js"

await test("DELETE /guilds/[guildId]/members/leave", async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test("succeeds", async () => {
    const { accessToken } = await authenticateUserTest()
    const member = {
      ...memberExample,
      isOwner: false,
    }
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return member
      },
      delete: async () => {
        return member
      },
    })
    const response = await application.inject({
      method: "DELETE",
      url: `/guilds/${guildExample.id}/members/leave`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.id, member.id)
    assert.strictEqual(responseJson.isOwner, member.isOwner)
    assert.strictEqual(responseJson.userId, member.userId)
  })

  await t.test("fails if the member is not found", async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return null
      },
    })
    const response = await application.inject({
      method: "DELETE",
      url: `/guilds/${guildExample.id}/members/leave`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    assert.strictEqual(response.statusCode, 404)
  })

  await t.test("fails if the member is owner", async () => {
    const { accessToken } = await authenticateUserTest()
    const member = {
      ...memberExample,
      isOwner: true,
    }
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return member
      },
    })
    const response = await application.inject({
      method: "DELETE",
      url: `/guilds/${guildExample.id}/members/leave`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    assert.strictEqual(response.statusCode, 400)
  })
})
