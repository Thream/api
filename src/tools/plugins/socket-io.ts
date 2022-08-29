import fastifyPlugin from 'fastify-plugin'
import { Server as SocketIoServer, ServerOptions } from 'socket.io'
import { authorize } from '@thream/socketio-jwt'

import prisma from '../database/prisma.js'
import { JWT_ACCESS_SECRET } from '../configurations/index.js'

interface EmitEventOptions {
  event: string
  payload: {
    action: 'create' | 'delete' | 'update'
    item: object
  }
}

interface EmitToAuthorizedUsersOptions extends EmitEventOptions {
  /** tests whether the current connected userId is authorized to get the event, if the callback returns true, the server will emit the event to that user */
  isAuthorizedCallback: (userId: number) => Promise<boolean> | boolean
}

type EmitToAuthorizedUsers = (
  options: EmitToAuthorizedUsersOptions
) => Promise<void>

interface EmitToMembersOptions extends EmitEventOptions {
  guildId: number
}

type EmitToMembers = (options: EmitToMembersOptions) => Promise<void>

interface FastifyIo {
  instance: SocketIoServer
  emitToAuthorizedUsers: EmitToAuthorizedUsers
  emitToMembers: EmitToMembers
}

declare module 'fastify' {
  export interface FastifyInstance {
    io: FastifyIo
  }
}

export default fastifyPlugin(
  async (fastify, options: Partial<ServerOptions>) => {
    const instance = new SocketIoServer(fastify.server, options)
    instance.use(
      authorize({
        secret: JWT_ACCESS_SECRET
      })
    )
    const emitToAuthorizedUsers: EmitToAuthorizedUsers = async (options) => {
      const { event, payload, isAuthorizedCallback } = options
      const clients = await instance.sockets.allSockets()
      for (const clientId of clients) {
        const client = instance.sockets.sockets.get(clientId)
        if (client != null) {
          const userId = client.decodedToken.id
          const isAuthorized = await isAuthorizedCallback(userId)
          if (isAuthorized) {
            client.emit(event, payload)
          }
        }
      }
    }
    const emitToMembers: EmitToMembers = async (options) => {
      const { event, payload, guildId } = options
      await emitToAuthorizedUsers({
        event,
        payload,
        isAuthorizedCallback: async (userId) => {
          const memberCount = await prisma.member.count({
            where: { userId, guildId }
          })
          return memberCount > 0
        }
      })
    }
    const io: FastifyIo = {
      instance,
      emitToAuthorizedUsers,
      emitToMembers
    }
    fastify.decorate('io', io)
    fastify.addHook('onClose', (fastify) => {
      fastify.io.instance.close()
    })
  },
  { fastify: '4.x' }
)
