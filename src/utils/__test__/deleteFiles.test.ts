import fsMock from 'mock-fs'
import * as fsWithCallbacks from 'fs'

import { deleteAllFilesInDirectory, deleteFilesByName } from '../deleteFiles'

const fs = fsWithCallbacks.promises

describe('utils/deleteFiles - deleteFilesByName', () => {
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

  it('should not delete files with 2 extensions', async () => {
    fsMock({
      '/files': {
        'default.png': '',
        'user-logo.png.png': '',
        'user-logo.jpg': ''
      }
    })

    await deleteFilesByName({
      directoryPath: '/files',
      filesNameToDelete: 'user-logo',
      filesToExclude: ['default.png']
    })

    const directoryContent = await fs.readdir('/files')
    expect(directoryContent).toEqual(['default.png', 'user-logo.png.png'])
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
