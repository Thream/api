import Member from '../../models/Member'
import { socket } from '.'

interface EmitEventOptions {
  event: string
  payload: {
    action: 'create' | 'delete' | 'update'
    item: object
  }
}

interface EmitToMembersOptions extends EmitEventOptions {
  guildId: number
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
  const clients = (await socket.io?.sockets.allSockets()) ?? new Set()
  for (const clientId of clients) {
    const client = socket.io?.sockets.sockets.get(clientId)
    if (client != null) {
      const userId = client.decodedToken.id
      const isAuthorized = await isAuthorizedCallback(userId)
      if (isAuthorized) {
        client.emit(event, payload)
      }
    }
  }
}

/** emits socket.io event to every connected members of the guild */
export const emitToMembers = async (
  options: EmitToMembersOptions
): Promise<void> => {
  const { event, payload, guildId } = options
  await emitToAuthorizedUsers({
    event,
    payload,
    isAuthorizedCallback: async (userId) => {
      const member = await Member.count({
        where: { userId, guildId }
      })
      return member > 0
    }
  })
}
