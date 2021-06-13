import fsMock from 'mock-fs'
import * as fsWithCallbacks from 'fs'

import {
  deleteAllFilesInDirectory,
  deleteFile,
  deleteMessages
} from '../deleteFiles'
import { messagesFilePath, usersLogoPath } from '../../configurations/constants'
import Message from '../../../models/Message'
import Guild from '../../../models/Guild'
import Member from '../../../models/Member'
import Channel from '../../../models/Channel'
import User from '../../../models/User'

const fs = fsWithCallbacks.promises

describe('/tools/utils/deleteFiles - deleteAllFilesInDirectory', () => {
  it('delete all the files expect the directories', async () => {
    fsMock({
      '/files': {
        'default.png': '',
        'user-logo.png': '',
        'user-logo.jpg': '',
        directory: {
          file: ''
        }
      }
    })
    await deleteAllFilesInDirectory('/files')
    const directoryContent = await fs.readdir('/files')
    expect(directoryContent.length).toEqual(1)
    expect(directoryContent[0]).toEqual('directory')
  })

  it('delete all the files with all the directories recursively', async () => {
    fsMock({
      '/files': {
        'default.png': '',
        'user-logo.png': '',
        'user-logo.jpg': '',
        directory: {
          file: ''
        }
      }
    })
    await deleteAllFilesInDirectory('/files', true)
    const filesDirectoryContent = await fs.readdir('/files')
    const directoryContent = await fs.readdir('/files/directory')
    expect(filesDirectoryContent.length).toEqual(1)
    expect(directoryContent.length).toEqual(0)
  })
})

describe('/tools/utils/deleteFiles - deleteFile', () => {
  it('should delete the file', async () => {
    fsMock({
      [usersLogoPath.filePath]: {
        'logo.png': ''
      }
    })
    await deleteFile({
      basePath: usersLogoPath,
      valueSavedInDatabase: `${usersLogoPath.name}/logo.png`
    })
    const directoryContent = await fs.readdir(usersLogoPath.filePath)
    expect(directoryContent.length).toEqual(0)
  })

  it('should not delete the default file', async () => {
    fsMock({
      [usersLogoPath.filePath]: {
        'logo.png': '',
        'default.png': ''
      }
    })
    await deleteFile({
      basePath: usersLogoPath,
      valueSavedInDatabase: `${usersLogoPath.name}/default.png`
    })
    const directoryContent = await fs.readdir(usersLogoPath.filePath)
    expect(directoryContent.length).toEqual(2)
  })
})

describe('/tools/utils/deleteFiles - deleteMessages', () => {
  it('should delete every messages and files', async () => {
    fsMock({
      [messagesFilePath.filePath]: {
        'logo.png': '',
        'random-file.mp3': '',
        'file-without-message': ''
      }
    })
    const user = await User.create({ name: 'John' })
    const guild = await Guild.create({ name: 'testing' })
    const channel = await Channel.create({
      name: 'general',
      isDefault: true,
      guildId: guild.id
    })
    const member = await Member.create({
      userId: user.id,
      guildId: guild.id,
      isOwner: true,
      lastVisitedChannelId: channel.id
    })
    const messagesToCreate = [
      { value: `${messagesFilePath.name}/logo.png`, type: 'file' },
      { value: `${messagesFilePath.name}/random-file.mp3`, type: 'file' }
    ]
    const messages = messagesToCreate.map(async (message) => {
      return await Message.create({
        value: message.value,
        type: message.type,
        memberId: member.id,
        channelId: channel.id
      })
    })
    await deleteMessages(await Promise.all(messages))
    const directoryContent = await fs.readdir(messagesFilePath.filePath)
    expect(directoryContent.length).toEqual(1)
  })
})
