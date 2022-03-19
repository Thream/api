import tap from 'tap'

import { parseStringNullish } from '../parseStringNullish.js'

const defaultString = 'defaultString'

await tap.test(
  'returns `defaultString` if `string === undefined`',
  async (t) => {
    t.equal(parseStringNullish(defaultString, undefined), defaultString)
  }
)

await tap.test('returns `null` if `string === null`', async (t) => {
  t.equal(parseStringNullish(defaultString, null), null)
})

await tap.test('returns `null` if `string.length === 0`', async (t) => {
  t.equal(parseStringNullish(defaultString, ''), null)
})

await tap.test('returns `string` if `string.length > 0`', async (t) => {
  const string = 'myString'
  t.equal(parseStringNullish(defaultString, string), string)
})
