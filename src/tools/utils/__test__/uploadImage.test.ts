import fsMock from 'mock-fs'
import * as fsWithCallbacks from 'fs'
import { UploadedFile } from 'express-fileupload'

import { uploadImage } from '../uploadImage'
import { PayloadTooLargeError } from '../../errors/PayloadTooLargeError'
import { tempPath, usersLogoPath } from '../../configurations/constants'
import { BadRequestError } from '../../errors/BadRequestError'

const fs = fsWithCallbacks.promises

const imagesPath = usersLogoPath.filePath

const getImage = (
  props: { truncated?: boolean, mimetype?: string } = {}
): UploadedFile => {
  const { truncated = false, mimetype = 'image/png' } = props
  return {
    name: 'logo',
    mv: jest.fn(),
    encoding: 'utf-8',
    mimetype,
    data: Buffer.from([]),
    tempFilePath: '/temp/logo.png',
    truncated,
    size: 1024,
    md5: '12345abcd'
  }
}

describe('/tools/utils/uploadImage', () => {
  it('should succeeds and save the image', async () => {
    fsMock({
      [tempPath]: {
        'logo.png': ''
      },
      [imagesPath]: {
        'logo.png': ''
      }
    })
    const image = getImage()
    const result = await uploadImage({
      image,
      propertyName: 'logo',
      oldImage: '/images/logo.png',
      imagesPath
    })
    expect(result).not.toBeNull()
    expect(image.mv).toHaveBeenCalled()
    const directoryContent = await fs.readdir(tempPath)
    expect(directoryContent.length).toEqual(0)
  })

  it('should returns null with undefined image file(s)', async () => {
    const result = await uploadImage({
      image: [getImage(), getImage()],
      propertyName: 'logo',
      oldImage: '/images/logo.png',
      imagesPath
    })
    const result2 = await uploadImage({
      image: undefined,
      propertyName: 'logo',
      oldImage: '/images/logo.png',
      imagesPath
    })
    expect(result).toBeNull()
    expect(result2).toBeNull()
  })

  it('should fails if the file is over the size limit', async () => {
    fsMock({
      [tempPath]: {
        'logo.png': ''
      }
    })
    await expect(
      uploadImage({
        image: getImage({ truncated: true }),
        propertyName: 'logo',
        oldImage: '/images/logo.png',
        imagesPath
      })
    ).rejects.toThrow(PayloadTooLargeError)
    const directoryContent = await fs.readdir(tempPath)
    expect(directoryContent.length).toEqual(0)
  })

  it('should fails if the file is not an image', async () => {
    fsMock({
      [tempPath]: {
        'logo.png': ''
      }
    })
    await expect(
      uploadImage({
        image: getImage({ mimetype: 'text/html' }),
        propertyName: 'logo',
        oldImage: '/images/logo.png',
        imagesPath
      })
    ).rejects.toThrow(BadRequestError)
    const directoryContent = await fs.readdir(tempPath)
    expect(directoryContent.length).toEqual(0)
  })
})
