import { Options as FileUploadOptions } from 'express-fileupload'
import path from 'path'

import { capitalize } from '../utils/capitalize'

export const srcPath = path.join(__dirname, '..', '..')
export const rootPath = path.join(srcPath, '..')
export const tempPath = path.join(rootPath, 'temp')
export const uploadsPath = path.join(rootPath, 'uploads')
export const guildsIconPath = {
  name: '/uploads/guilds',
  filePath: path.join(uploadsPath, 'guilds')
} as const
export const usersLogoPath = {
  name: '/uploads/users',
  filePath: path.join(uploadsPath, 'users')
} as const
export const messagesFilePath = {
  name: '/uploads/messages',
  filePath: path.join(uploadsPath, 'messages')
} as const
export const emailPath = path.join(rootPath, 'email')
export const emailTemplatePath = path.join(emailPath, 'email-template.ejs')
export const emailLocalesPath = path.join(emailPath, 'locales')

export const authorizedRedirectDomains = [
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000/'] : []),
  'https://thream.divlo.fr/'
] as const

export const supportedImageMimetype = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif'
]

/** in megabytes */
export const maximumImageSize = 10
export const maximumFileSize = 100

const basicFileUploadOptions: FileUploadOptions = {
  useTempFiles: true,
  tempFileDir: tempPath,
  safeFileNames: true,
  preserveExtension: Number(),
  parseNested: true,
  debug: process.env.NODE_ENV === 'development'
}

export const imageFileUploadOptions: FileUploadOptions = {
  ...basicFileUploadOptions,
  limits: { fileSize: maximumImageSize * 1024 * 1024 }
}

export const fileUploadOptions: FileUploadOptions = {
  ...basicFileUploadOptions,
  limits: { fileSize: maximumFileSize * 1024 * 1024 }
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
  tooLargeFile: (name: string) =>
    `The ${name} should be less than ${maximumFileSize}mb`,
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
      if (min >= max) {
        throw new Error('min should be less than max')
      }
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
