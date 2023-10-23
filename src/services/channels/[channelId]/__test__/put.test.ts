import test from "node:test"
import assert from "node:assert/strict"

import sinon from "sinon"

import { application } from "#src/application.js"
import { authenticateUserTest } from "#src/__test__/utils/authenticateUserTest.js"
import prisma from "#src/tools/database/prisma.js"
import { channelExample } from "#src/models/Channel.js"
import { memberExample } from "#src/models/Member.js"

const newName = "new channel name"

await test("PUT /channels/[channelId]", async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test("succeeds", async () => {
    const defaultChannelId = 5
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, "channel").value({
      findUnique: async () => {
        return channelExample
      },
      findFirst: async () => {
        return {
          ...channelExample,
          id: defaultChannelId,
        }
      },
      update: async () => {
        return {
          ...channelExample,
          name: newName,
        }
      },
    })
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return memberExample
      },
    })
    const response = await application.inject({
      method: "PUT",
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: { name: newName },
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.id, channelExample.id)
    assert.strictEqual(responseJson.name, newName)
    assert.strictEqual(responseJson.guildId, channelExample.guildId)
    assert.strictEqual(responseJson.defaultChannelId, defaultChannelId)
  })

  await t.test("fails if the channel is not found", async () => {
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
      method: "PUT",
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: { name: newName },
    })
    assert.strictEqual(response.statusCode, 404)
  })

  await t.test("fails if the member is not found", async () => {
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
      method: "PUT",
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: { name: newName },
    })
    assert.strictEqual(response.statusCode, 404)
  })

  await t.test("fails if the member is not owner", async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, "channel").value({
      findUnique: async () => {
        return channelExample
      },
    })
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return {
          ...memberExample,
          isOwner: false,
        }
      },
    })
    const response = await application.inject({
      method: "PUT",
      url: `/channels/${channelExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: { name: newName },
    })
    assert.strictEqual(response.statusCode, 400)
  })
})
