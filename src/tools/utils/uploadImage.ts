import { UploadedFile } from 'express-fileupload'
import * as fsWithCallbacks from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import {
  commonErrorsMessages,
  supportedImageMimetype,
  tempPath
} from '../configurations/constants'
import { deleteAllFilesInDirectory } from './deleteFiles'
import { BadRequestError } from '../errors/BadRequestError'
import { PayloadTooLargeError } from '../errors/PayloadTooLargeError'

const fs = fsWithCallbacks.promises

interface UploadImageOptions {
  image: UploadedFile | UploadedFile[] | undefined
  propertyName: string
  oldImage: string
  imagesPath: string
}

/**
 * @description Handle upload of an image
 * @returns the complete image name if success otherwise null
 */
export const uploadImage = async (
  options: UploadImageOptions
): Promise<string | null> => {
  const { image, propertyName, oldImage, imagesPath } = options
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
    const completeImageName = `${uuidv4()}.${imageExtension}`
    const oldImagePath = oldImage.split('/')
    const oldImageName = oldImagePath[oldImagePath.length - 1]
    if (!oldImageName.startsWith('default')) {
      await fs.unlink(path.join(imagesPath, oldImageName))
    }
    await image.mv(path.join(imagesPath, completeImageName))
    await deleteAllFilesInDirectory(tempPath)
    return completeImageName
  }
  return null
}
