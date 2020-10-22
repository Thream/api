import { Server as HttpServer } from 'http'
import { Server as HttpsServer } from 'https'
import socketIo, { Server } from 'socket.io'

interface Socket {
  io: null | Server
  init: (httpServer: HttpServer | HttpsServer) => void
}

export const socket: Socket = {
  io: null,
  init (httpServer) {
    socket.io = socketIo(httpServer)
  }
}
