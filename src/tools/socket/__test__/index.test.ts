import express from 'express'
import enableDestroy from 'server-destroy'

import { socket } from '../index'

describe('/tools/socket', () => {
  it('should setup the socket.io server', () => {
    expect(socket?.io).toBeNull()
    const app = express()
    const server = app.listen()
    enableDestroy(server)
    socket.init(server)
    expect(socket?.io).toBeDefined()
    server.destroy()
    socket.io?.close()
  })
})
