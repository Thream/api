import test from "node:test"
import assert from "node:assert/strict"

import sinon from "sinon"
import httpErrors from "http-errors"
import jwt from "jsonwebtoken"

import { getUserWithBearerToken } from "#src/tools/plugins/authenticateUser.js"
import prisma from "#src/tools/database/prisma.js"
import { userExample } from "#src/models/User.js"

const { Unauthorized, Forbidden, BadRequest } = httpErrors

await test("tools/plugins/authenticateUser - getUserWithBearerToken", async (t) => {
  t.afterEach(() => {
    sinon.restore()
  })

  await t.test("shoulds succeeds with the right information", async () => {
    sinon.stub(prisma, "user").value({
      findUnique: async () => {
        return userExample
      },
    })
    const currentStrategy = "Local"
    sinon.stub(jwt, "verify").value(() => {
      return { id: userExample.id, currentStrategy }
    })
    const userWithBearerToken = await getUserWithBearerToken("Bearer token")
    assert.strictEqual(userWithBearerToken.current.id, userExample.id)
    assert.strictEqual(userWithBearerToken.current.name, userExample.name)
    assert.strictEqual(userWithBearerToken.accessToken, "token")
    assert.strictEqual(userWithBearerToken.currentStrategy, currentStrategy)
  })

  await t.test(
    "shoulds throws `Unauthorized` if `bearerToken` is not a string",
    async () => {
      await assert.rejects(getUserWithBearerToken(undefined), Unauthorized)
    },
  )

  await t.test(
    'shoulds throws `Unauthorized` if `bearerToken` is not to the right format: `"Bearer token"`',
    async () => {
      await assert.rejects(getUserWithBearerToken("Bearer"), Unauthorized)
      await assert.rejects(getUserWithBearerToken(""), Unauthorized)
      await assert.rejects(
        getUserWithBearerToken("Bearer token token2"),
        Unauthorized,
      )
    },
  )

  await t.test(
    "shoulds throws `Forbidden` if invalid `bearerToken` by `jwt.verify`",
    async () => {
      sinon.stub(jwt, "verify").value(() => {
        throw new Error("Invalid token")
      })
      await assert.rejects(getUserWithBearerToken("Bearer token"), Forbidden)
    },
  )

  await t.test(
    "shoulds throws `Forbidden` if the user doesn't exist",
    async () => {
      sinon.stub(prisma, "user").value({
        findUnique: async () => {
          return null
        },
      })
      sinon.stub(jwt, "verify").value(() => {
        return { id: userExample.id }
      })
      await assert.rejects(getUserWithBearerToken("Bearer token"), Forbidden)
    },
  )

  await t.test(
    "shoulds throws `BadRequest` if the user account is not confirmed",
    async () => {
      sinon.stub(prisma, "user").value({
        findUnique: async () => {
          return {
            ...userExample,
            isConfirmed: false,
          }
        },
      })
      sinon.stub(jwt, "verify").value(() => {
        return { id: userExample.id, currentStrategy: "Local" }
      })
      await assert.rejects(getUserWithBearerToken("Bearer token"), BadRequest)
    },
  )
})
