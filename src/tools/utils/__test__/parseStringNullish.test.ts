import { parseStringNullish } from '../parseStringNullish.js'

const defaultString = 'defaultString'

describe('/tools/utils/parseStringNullish', () => {
  it('returns `defaultString` if `string === undefined`', () => {
    expect(parseStringNullish(defaultString, undefined)).toEqual(defaultString)
  })

  it('returns `null` if `string === null`', () => {
    expect(parseStringNullish(defaultString, null)).toEqual(null)
  })

  it('returns `null` if `string.length === 0`', () => {
    expect(parseStringNullish(defaultString, '')).toEqual(null)
  })

  it('returns `string` if `string.length > 0`', () => {
    const string = 'myString'
    expect(parseStringNullish(defaultString, string)).toEqual(string)
  })
})
