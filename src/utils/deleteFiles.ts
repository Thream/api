import * as fsWithCallbacks from 'fs'
import path from 'path'

const fs = fsWithCallbacks.promises

type DeleteFilesByName = (options: DeleteFilesByNameOptions) => Promise<void>

interface DeleteFilesByNameOptions {
  filesNameToDelete: string
  directoryPath: string
  filesToExclude: string[]
}

/** Delete files by their names (without taking into account the extension) */
export const deleteFilesByName: DeleteFilesByName = async options => {
  const { filesNameToDelete, directoryPath, filesToExclude } = options
  const filesNames = await fs.readdir(path.resolve(directoryPath))
  for (const name of filesNames) {
    const splitedName = name.split('.')
    if (splitedName.length === 2) {
      const fileName = splitedName[0]
      if (fileName === filesNameToDelete && !filesToExclude.includes(name)) {
        await fs.unlink(path.join(directoryPath, name))
      }
    }
  }
}

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
