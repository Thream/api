import { Server as HttpServer } from 'http'
import { Server as HttpsServer } from 'https'
import socketIo, { Server as SocketIoServer } from 'socket.io'

import Member from '../../models/Member'

interface Socket {
  io: null | SocketIoServer
  init: (httpServer: HttpServer | HttpsServer) => void
}

export const socket: Socket = {
  io: null,
  init (httpServer) {
    socket.io = socketIo(httpServer)
  }
}

interface EmitToMembersOptions {
  event: string
  payload: {
    action: 'create' | 'delete' | 'update'
    [key: string]: any
  }
  guildId: number
}

/** emits socket.io event to every connected members of the guild */
export const emitToMembers = (options: EmitToMembersOptions): void => {
  const { event, payload, guildId } = options
  socket.io?.sockets.clients(async (_error: Error, clients: string[]) => {
    for (const clientId of clients) {
      const client = socket.io?.sockets.connected[clientId]
      const userId: number = (client as any).decoded_token?.id
      const member = await Member.findOne({
        where: { userId, guildId }
      })
      if (member != null) {
        client?.emit(event, payload)
      }
    }
  })
}
