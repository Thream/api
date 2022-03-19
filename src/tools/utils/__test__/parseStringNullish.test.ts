import tap from 'tap'

import { parseStringNullish } from '../parseStringNullish.js'

const defaultString = 'defaultString'

await tap.test('/tools/utils/parseStringNullish', async (t) => {
  await t.test(
    'returns `defaultString` if `string === undefined`',
    async (t) => {
      t.equal(parseStringNullish(defaultString, undefined), defaultString)
    }
  )

  await t.test('returns `null` if `string === null`', async (t) => {
    t.equal(parseStringNullish(defaultString, null), null)
  })

  await t.test('returns `null` if `string.length === 0`', async (t) => {
    t.equal(parseStringNullish(defaultString, ''), null)
  })

  await t.test('returns `string` if `string.length > 0`', async (t) => {
    const string = 'myString'
    t.equal(parseStringNullish(defaultString, string), string)
  })
})
