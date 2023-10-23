import test from "node:test"
import assert from "node:assert/strict"

import sinon from "sinon"

import { application } from "#src/application.js"
import { authenticateUserTest } from "#src/__test__/utils/authenticateUserTest.js"
import prisma from "#src/tools/database/prisma.js"
import { channelExample } from "#src/models/Channel.js"
import { memberExample } from "#src/models/Member.js"

await test("GET /channels/[channelId]", async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test("succeeds", async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, "channel").value({
      findUnique: async () => {
        return channelExample
      },
    })
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return memberExample
      },
    })
    const response = await application.inject({
      method: "GET",
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.channel.id, channelExample.id)
    assert.strictEqual(responseJson.channel.name, channelExample.name)
    assert.strictEqual(responseJson.channel.guildId, channelExample.guildId)
  })

  await t.test("fails with not found member", async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, "channel").value({
      findUnique: async () => {
        return channelExample
      },
    })
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return null
      },
    })
    const response = await application.inject({
      method: "GET",
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 404)
    assert.strictEqual(responseJson.message, "Channel not found")
  })

  await t.test("fails with not found channel", async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, "channel").value({
      findUnique: async () => {
        return null
      },
    })
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return memberExample
      },
    })
    const response = await application.inject({
      method: "GET",
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 404)
    assert.strictEqual(responseJson.message, "Channel not found")
  })

  await t.test("fails with unauthenticated user", async () => {
    const response = await application.inject({
      method: "GET",
      url: "/channels/1",
    })
    assert.strictEqual(response.statusCode, 401)
  })
})
