import {
  commonErrorsMessages,
  maximumFileSize,
  maximumImageSize,
  supportedImageMimetype
} from '../constants'

test('/tools/config/constants', () => {
  expect(commonErrorsMessages.image.tooLarge('logo')).toEqual(
    `The logo must have a valid image, less than ${maximumImageSize}mb`
  )
  expect(commonErrorsMessages.image.validType('logo')).toEqual(
    `The logo must have a valid type (${supportedImageMimetype.join(', ')})`
  )
  expect(commonErrorsMessages.tooLargeFile('file')).toEqual(
    `The file should be less than ${maximumFileSize}mb`
  )
  expect(commonErrorsMessages.charactersLength('name', {})).toEqual(
    'Name should not be empty'
  )
  expect(commonErrorsMessages.charactersLength('name', { min: 3 })).toEqual(
    'Name should be at least 3 characters'
  )
  expect(commonErrorsMessages.charactersLength('name', { max: 3 })).toEqual(
    'Name must be no longer than 3 characters'
  )
  expect(
    commonErrorsMessages.charactersLength('name', { min: 3, max: 5 })
  ).toEqual('Name must be between 3 and 5 characters')
  expect(() => {
    commonErrorsMessages.charactersLength('name', { min: 12, max: 5 })
  }).toThrowError('min should be less than max')
})
