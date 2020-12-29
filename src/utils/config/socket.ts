import { Server as HttpServer } from 'http'
import { Server as HttpsServer } from 'https'
import { Server as SocketIoServer } from 'socket.io'

import Member from '../../models/Member'

interface Socket {
  io: null | SocketIoServer
  init: (httpServer: HttpServer | HttpsServer) => void
}

export const socket: Socket = {
  io: null,
  init (httpServer) {
    socket.io = new SocketIoServer(httpServer)
  }
}

interface EmitEventOptions {
  event: string
  payload: {
    action: 'create' | 'delete' | 'update'
    [key: string]: any
  }
}

interface EmitToMembersOptions extends EmitEventOptions {
  guildId: number
  onlyOwner?: boolean
}

interface EmitToAuthorizedUsersOptions extends EmitEventOptions {
  /** tests whether the current connected userId is authorized to get the event, if the callback returns true, the server will emit the event to that user */
  isAuthorizedCallback: (userId: number) => Promise<boolean>
}

/** emits socket.io event to every connected authorized users */
export const emitToAuthorizedUsers = async (
  options: EmitToAuthorizedUsersOptions
): Promise<void> => {
  const { event, payload, isAuthorizedCallback } = options
  const clients = await socket.io?.sockets.allSockets()
  if (clients != null) {
    for (const clientId of clients) {
      const client = socket.io?.sockets.sockets.get(clientId)
      const userId: number = (client as any).decodedToken?.id
      const isAuthorized = await isAuthorizedCallback(userId)
      if (isAuthorized && client != null) {
        client.emit(event, payload)
      }
    }
  }
}

/** emits socket.io event to every connected members of the guild */
export const emitToMembers = async (options: EmitToMembersOptions): Promise<void> => {
  const { event, payload, guildId, onlyOwner = false } = options
  await emitToAuthorizedUsers({
    event,
    payload,
    isAuthorizedCallback: async (userId) => {
      const member = await Member.count({
        where: { userId, guildId, ...(onlyOwner && { isOwner: true }) }
      })
      return member > 0
    }
  })
}
