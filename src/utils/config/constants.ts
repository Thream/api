import { Options as FileUploadOptions } from 'express-fileupload'
import path from 'path'

import { capitalize } from '../capitalize'

export const srcPath = path.join(__dirname, '..', '..')
export const rootPath = path.join(srcPath, '..')
export const tempPath = path.join(rootPath, 'temp')
export const imagesPath = path.join(rootPath, 'public', 'images')
export const emailTemplatePath = path.join(
  rootPath,
  'views',
  'email-template.ejs'
)
export const guildsIconPath = path.join(imagesPath, 'guilds')

export const authorizedRedirectDomains = [
  'http://localhost:3000/',
  'https://thream.divlo.fr/'
]

export const supportedImageMimetype = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif'
]

/** in megabytes */
export const maximumImageSize = 6

export const imageFileUploadOptions: FileUploadOptions = {
  useTempFiles: true,
  tempFileDir: tempPath,
  safeFileNames: true,
  preserveExtension: 4,
  limits: { fileSize: 6 * 1024 * 1024 },
  parseNested: true,
  debug: process.env.NODE_ENV === 'development'
}

export const commonErrorsMessages = {
  image: {
    tooLarge: (name: string) =>
      `The ${name} must have a valid image, less than ${maximumImageSize}mb`,
    validType: (name: string) =>
      `The ${name} must have a valid type (${supportedImageMimetype.join(
        ', '
      )})`
  },
  charactersLength: (
    name: string,
    {
      min,
      max
    }: {
      min?: number
      max?: number
    }
  ) => {
    const capitalizedName = capitalize(name)
    if (min != null && max != null) {
      return `${capitalizedName} must be between ${min} and ${max} characters`
    }

    if (max != null) {
      return `${capitalizedName} must be no longer than ${max} characters`
    }

    if (min != null) {
      return `${capitalizedName} should be at least ${min} characters`
    }

    return `${capitalizedName} should not be empty`
  }
}
