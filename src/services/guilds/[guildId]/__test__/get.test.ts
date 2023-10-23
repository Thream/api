import test from "node:test"
import assert from "node:assert/strict"

import sinon from "sinon"

import { application } from "#src/application.js"
import { authenticateUserTest } from "#src/__test__/utils/authenticateUserTest.js"
import prisma from "#src/tools/database/prisma.js"
import { memberExample } from "#src/models/Member.js"
import { guildExample } from "#src/models/Guild.js"
import { userExample } from "#src/models/User.js"
import { channelExample } from "#src/models/Channel.js"

const defaultChannelId = 5

await test("GET /guilds/[guildId]", async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test("succeeds", async () => {
    const { accessToken, user } = await authenticateUserTest()
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return {
          ...memberExample,
          guild: guildExample,
          user: userExample,
        }
      },
    })
    sinon.stub(prisma, "channel").value({
      findFirst: async () => {
        return {
          ...channelExample,
          id: defaultChannelId,
        }
      },
    })
    const response = await application.inject({
      method: "GET",
      url: `/guilds/${guildExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.member.id, memberExample.id)
    assert.strictEqual(responseJson.member.isOwner, memberExample.isOwner)
    assert.strictEqual(responseJson.member.user.name, user.name)
    assert.strictEqual(responseJson.member.user.email, null)
    assert.strictEqual(responseJson.guild.id, guildExample.id)
    assert.strictEqual(responseJson.guild.name, guildExample.name)
    assert.strictEqual(responseJson.guild.defaultChannelId, defaultChannelId)
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
      url: "/guilds/1",
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
      url: "/guilds/1",
    })
    assert.strictEqual(response.statusCode, 401)
  })
})
