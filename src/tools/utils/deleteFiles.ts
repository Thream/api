import * as fsWithCallbacks from 'fs'
import path from 'path'

import {
  guildsIconPath,
  messagesFilePath,
  usersLogoPath
} from '../configurations/constants'
import Message from '../../models/Message'

const fs = fsWithCallbacks.promises

export const deleteAllFilesInDirectory = async (
  directoryPath: string,
  isRecursive: boolean = false
): Promise<void> => {
  const files = await fs.readdir(directoryPath)
  for (const file of files) {
    const filePath = path.resolve(directoryPath, file)
    const stats = await fs.stat(filePath)
    if (stats.isFile()) {
      await fs.unlink(filePath)
    } else if (isRecursive && stats.isDirectory()) {
      await deleteAllFilesInDirectory(filePath, isRecursive)
    }
  }
}

type BasePath =
  | typeof guildsIconPath
  | typeof usersLogoPath
  | typeof messagesFilePath

export const deleteFile = async (options: {
  basePath: BasePath
  /** @example '/uploads/users/logo.png' */
  valueSavedInDatabase: string
}): Promise<void> => {
  const { basePath, valueSavedInDatabase: value } = options
  if (value !== `${basePath.name}/default.png`) {
    const filePath = value.split('/')
    const filename = filePath[filePath.length - 1]
    await fs.unlink(path.join(basePath.filePath, filename))
  }
}

export const deleteMessages = async (messages: Message[]): Promise<void> => {
  for (const message of messages) {
    if (message.type === 'file') {
      await deleteFile({
        basePath: messagesFilePath,
        valueSavedInDatabase: message.value
      })
    }
    await message.destroy()
  }
}
