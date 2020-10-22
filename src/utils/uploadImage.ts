import { UploadedFile } from 'express-fileupload'
import path from 'path'

import {
  commonErrorsMessages,
  supportedImageMimetype,
  tempPath
} from './config/constants'
import { deleteAllFilesInDirectory, deleteFilesByName } from './deleteFiles'
import { BadRequestError } from './errors/BadRequestError'
import { PayloadTooLargeError } from './errors/PayloadTooLargeError'

/**
 * @description Handle upload of an image
 * @returns the complete image name if success otherwise null
 */
export const uploadImage = async (options: {
  image: UploadedFile | UploadedFile[] | undefined
  propertyName: string
  imageName: string
  imagesPath: string
}): Promise<string | null> => {
  const { image, propertyName, imageName, imagesPath } = options
  if (image != null && !Array.isArray(image)) {
    if (image.truncated) {
      await deleteAllFilesInDirectory(tempPath)
      throw new PayloadTooLargeError(
        commonErrorsMessages.image.tooLarge(propertyName)
      )
    }

    if (!supportedImageMimetype.includes(image.mimetype)) {
      await deleteAllFilesInDirectory(tempPath)
      throw new BadRequestError(
        commonErrorsMessages.image.validType(propertyName)
      )
    }

    const splitedMimetype = image.mimetype.split('/')
    const imageExtension = splitedMimetype[1]
    const completeImageName = `${imageName}.${imageExtension}`

    // Removes old images
    await deleteFilesByName({
      directoryPath: imagesPath,
      filesNameToDelete: imageName,
      filesToExclude: ['default.png']
    })

    await image.mv(path.join(imagesPath, completeImageName))
    await deleteAllFilesInDirectory(tempPath)
    return completeImageName
  }
  return null
}
