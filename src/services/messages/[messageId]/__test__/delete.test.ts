import test from "node:test"
import assert from "node:assert/strict"

import sinon from "sinon"

import { application } from "#src/application.js"
import { authenticateUserTest } from "#src/__test__/utils/authenticateUserTest.js"
import prisma from "#src/tools/database/prisma.js"
import { messageExample } from "#src/models/Message.js"
import { memberExample } from "#src/models/Member.js"
import { userExample } from "#src/models/User.js"
import { channelExample } from "#src/models/Channel.js"

await test("DELETE /messsages/[messageId]", async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test("succeeds", async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, "message").value({
      findFirst: async () => {
        return {
          ...messageExample,
          channel: channelExample,
        }
      },
      delete: async () => {
        return messageExample
      },
    })
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return {
          ...memberExample,
          user: userExample,
        }
      },
    })
    const response = await application.inject({
      method: "DELETE",
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    const responseJson = response.json()
    assert.strictEqual(response.statusCode, 200)
    assert.strictEqual(responseJson.id, messageExample.id)
    assert.strictEqual(responseJson.value, messageExample.value)
    assert.strictEqual(responseJson.type, messageExample.type)
    assert.strictEqual(responseJson.mimetype, messageExample.mimetype)
    assert.strictEqual(responseJson.member.id, memberExample.id)
    assert.strictEqual(responseJson.member.isOwner, memberExample.isOwner)
    assert.strictEqual(responseJson.member.user.id, userExample.id)
    assert.strictEqual(responseJson.member.user.name, userExample.name)
  })

  await t.test("fails if the message is not found", async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, "message").value({
      findFirst: async () => {
        return null
      },
    })
    const response = await application.inject({
      method: "DELETE",
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    assert.strictEqual(response.statusCode, 404)
  })

  await t.test("fails if the member is not found", async () => {
    const { accessToken } = await authenticateUserTest()
    sinon.stub(prisma, "message").value({
      findFirst: async () => {
        return {
          ...messageExample,
          channel: channelExample,
        }
      },
    })
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return null
      },
    })
    const response = await application.inject({
      method: "DELETE",
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    assert.strictEqual(response.statusCode, 404)
  })

  await t.test("fails if the member is not owner of the message", async () => {
    const { accessToken } = await authenticateUserTest()
    const randomUserIdOwnerOfMessage = 14
    sinon.stub(prisma, "message").value({
      findFirst: async () => {
        return {
          ...messageExample,
          channel: channelExample,
        }
      },
    })
    sinon.stub(prisma, "member").value({
      findFirst: async () => {
        return {
          ...memberExample,
          userId: randomUserIdOwnerOfMessage,
        }
      },
    })
    const response = await application.inject({
      method: "DELETE",
      url: `/messages/${messageExample.id}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    assert.strictEqual(response.statusCode, 400)
  })
})
