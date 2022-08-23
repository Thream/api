import tap from 'tap'
import fastify from 'fastify'

import fastifySocketIo from '../socket-io.js'

await tap.test('tools/plugins/socket-io', async (t) => {
  await t.test('should close socket server on fastify close', async (t) => {
    const PORT = 3030
    const application = fastify()
    await application.register(fastifySocketIo)
    await application.listen({
      port: PORT
    })
    t.not(application.io, null)
    await application.close()
  })
})
