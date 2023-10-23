import test from "node:test"
import assert from "node:assert/strict"

import sinon from "sinon"

import { application } from "#src/application.js"
import { authenticateUserTest } from "#src/__test__/utils/authenticateUserTest.js"
import prisma from "#src/tools/database/prisma.js"
import { memberExample } from "#src/models/Member.js"
import { guildExample } from "#src/models/Guild.js"
import { channelExample } from "#src/models/Channel.js"

const defaultChannelId = 5

await test("POST /guilds/[guildId]/channels", async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test("succeeds", async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return memberExample
      },
    })
    sinon.stub(prisma, "channel").value({
      findFirst: async () => {
        return {
          ...channelExample,
          id: defaultChannelId,
        }
      },
      create: async () => {
        return channelExample
      },
    })
    const response = await application.inject({
      method: "POST",
      url: `/guilds/${guildExample.id}/channels`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: { name: channelExample.name },
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 201)
    assert.strictEqual(responseJson.id, channelExample.id)
    assert.strictEqual(responseJson.name, channelExample.name)
    assert.strictEqual(responseJson.guildId, channelExample.guildId)
    assert.strictEqual(responseJson.defaultChannelId, defaultChannelId)
  })

  await t.test("fails if the member is not found", async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return null
      },
    })
    const response = await application.inject({
      method: "POST",
      url: `/guilds/${guildExample.id}/channels`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: { name: channelExample.name },
    })
    assert.strictEqual(response.statusCode, 404)
  })

  await t.test("fails if the member is not owner", async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return {
          ...memberExample,
          isOwner: false,
        }
      },
    })
    const response = await application.inject({
      method: "POST",
      url: `/guilds/${guildExample.id}/channels`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: { name: channelExample.name },
    })
    assert.strictEqual(response.statusCode, 400)
  })
})
