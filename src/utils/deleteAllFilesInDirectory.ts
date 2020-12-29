import * as fsWithCallbacks from 'fs'
import path from 'path'

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
