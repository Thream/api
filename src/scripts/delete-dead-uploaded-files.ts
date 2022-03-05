import fs from 'node:fs'

import prisma from '../tools/database/prisma.js'
import { UPLOADS_URL } from '../tools/configurations/index.js'

const getPathStoredInDatabaseFromFile = (
  file: string,
  folderInUploadsFolder: string
): string => {
  return `/uploads/${folderInUploadsFolder}/${file}`
}

const deleteDeadUploadedFiles = async (
  folderInUploadsFolder: string,
  getElementInDatabase: (file: string) => Promise<unknown | null>
): Promise<void> => {
  const UPLOADS_FILES_URL = new URL(`./${folderInUploadsFolder}`, UPLOADS_URL)
  const files = await fs.promises.readdir(UPLOADS_FILES_URL)
  for (const file of files) {
    if (file !== '.gitkeep') {
      const pathStoredInDatabase = getPathStoredInDatabaseFromFile(
        file,
        folderInUploadsFolder
      )
      const element = await getElementInDatabase(pathStoredInDatabase)
      if (element == null) {
        const fileURL = new URL(
          `./${folderInUploadsFolder}/${file}`,
          UPLOADS_URL
        )
        await fs.promises.rm(fileURL)
      }
    }
  }
}

const main = async (): Promise<void> => {
  await deleteDeadUploadedFiles('guilds', async (icon: string) => {
    return await prisma.guild.findFirst({
      where: { icon }
    })
  })
  await deleteDeadUploadedFiles('messages', async (value: string) => {
    return await prisma.message.findFirst({
      where: { type: 'file', value }
    })
  })
  await deleteDeadUploadedFiles('users', async (logo: string) => {
    return await prisma.user.findFirst({
      where: { logo }
    })
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
