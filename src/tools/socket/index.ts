import { Server as HttpServer } from 'http'
import { Server as HttpsServer } from 'https'
import { Server as SocketIoServer } from 'socket.io'

interface Socket {
  io: null | SocketIoServer
  init: (httpServer: HttpServer | HttpsServer) => void
}

export const socket: Socket = {
  io: null,
  init (httpServer) {
    socket.io = new SocketIoServer(httpServer, {
      cors: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204
      }
    })
  }
}
