import test from "node:test"
import assert from "node:assert/strict"

import fastify from "fastify"

import fastifySocketIo from "#src/tools/plugins/socket-io.js"

await test("tools/plugins/socket-io", async (t) => {
  await t.test("should close socket server on fastify close", async () => {
    const PORT = 3030
    const application = fastify()
    await application.register(fastifySocketIo)
    await application.listen({
      port: PORT,
    })
    assert.notStrictEqual(application.io, null)
    await application.close()
  })
})
