import fsMock from 'mock-fs'
import * as fsWithCallbacks from 'fs'

import { deleteFilesByName } from '../deleteFiles'

const fs = fsWithCallbacks.promises

describe('utils/deleteFiles', () => {
  it('delete the files expect the file to exclude', async () => {
    fsMock({
      '/files': {
        'default.png': '',
        'user-logo.png': '',
        'user-logo.jpg': ''
      }
    })

    await deleteFilesByName({
      directoryPath: '/files',
      filesNameToDelete: 'user-logo',
      filesToExclude: ['default.png']
    })

    const directoryContent = await fs.readdir('/files')
    expect(directoryContent).toEqual(['default.png'])
  })

  it('delete all the files in the directory', async () => {
    fsMock({
      '/files': {
        'user-logo.png': '',
        'user-logo.jpg': ''
      }
    })

    await deleteFilesByName({
      directoryPath: '/files',
      filesNameToDelete: 'user-logo',
      filesToExclude: []
    })

    const directoryContent = await fs.readdir('/files')
    expect(directoryContent.length).toEqual(0)
  })

  it('delete no files at all', async () => {
    fsMock({
      '/files': {
        'user-logo.png': '',
        'user-logo.jpg': ''
      }
    })

    await deleteFilesByName({
      directoryPath: '/files',
      filesNameToDelete: 'some-files-to-delete',
      filesToExclude: []
    })

    const directoryContent = await fs.readdir('/files')
    expect(directoryContent.length).toEqual(2)
  })
})
