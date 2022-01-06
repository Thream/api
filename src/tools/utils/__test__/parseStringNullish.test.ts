import { parseStringNullish } from '../parseStringNullish.js'

const defaultString = 'defaultString'

describe('/tools/utils/parseStringNullish', () => {
  it('returns `null` if `string.length === 0`', () => {
    expect(parseStringNullish(defaultString, '')).toEqual(null)
  })

  it('returns `defaultString` if `string == null`', () => {
    expect(parseStringNullish(defaultString)).toEqual(defaultString)
  })

  it('returns `string` if `string.length > 0`', () => {
    expect(parseStringNullish(defaultString, 'string')).toEqual('string')
  })
})
