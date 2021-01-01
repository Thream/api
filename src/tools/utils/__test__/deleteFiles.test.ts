import fsMock from 'mock-fs'
import * as fsWithCallbacks from 'fs'

import { deleteAllFilesInDirectory } from '../deleteFiles'

const fs = fsWithCallbacks.promises

describe('utils/deleteFiles - deleteAllFilesInDirectory', () => {
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
