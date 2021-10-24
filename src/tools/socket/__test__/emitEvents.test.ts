import express from 'express'
import { authorize } from '@thream/socketio-jwt'
import { Server as HttpServer } from 'http'
import enableDestroy from 'server-destroy'
import { io, Socket } from 'socket.io-client'

import { authenticateUserTest } from '../../../__test__/utils/authenticateUser'
import { emitToAuthorizedUsers } from '../emitEvents'
import { socket } from '../index'

describe('/tools/socket/emitEvents', () => {
  let server: HttpServer | null = null
  let socketClient: Socket | null = null

  beforeEach(async (done) => {
    jest.setTimeout(15_000)
    const app = express()
    server = app.listen(9000)
    enableDestroy(server)
    socket.init(server)
    socket.io?.use(
      authorize({
        secret: process.env.JWT_ACCESS_SECRET
      })
    )
    const userToken = await authenticateUserTest()
    socketClient = io('http://localhost:9000', {
      auth: {
        token: `${userToken.type} ${userToken.accessToken}`
      }
    })
    socketClient.on('connect', () => {
      done()
    })
  })

  afterEach(() => {
    socket.io?.close()
    try {
      server?.destroy()
    } catch {}
  })

  it('should emit the event to authenticated users - emitToAuthorizedUsers', async (done) => {
    socketClient?.on('messages', (data: any) => {
      expect(data.action).toEqual('create')
      expect(data.item.id).toEqual(1)
      expect(data.item.message).toEqual('awesome')
      socketClient?.close()
      done()
    })
    await emitToAuthorizedUsers({
      event: 'messages',
      isAuthorizedCallback: async () => true,
      payload: { action: 'create', item: { id: 1, message: 'awesome' } }
    })
  })
})
