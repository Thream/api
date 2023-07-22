import test from 'node:test'
import assert from 'node:assert/strict'

import { parseStringNullish } from '../parseStringNullish.js'

const defaultString = 'defaultString'

await test('tools/utils/parseStringNullish', async (t) => {
  await t.test(
    'returns `defaultString` if `string === undefined`',
    async () => {
      assert.strictEqual(
        parseStringNullish(defaultString, undefined),
        defaultString
      )
    }
  )

  await t.test('returns `null` if `string === null`', async () => {
    assert.strictEqual(parseStringNullish(defaultString, null), null)
  })

  await t.test('returns `null` if `string.length === 0`', async () => {
    assert.strictEqual(parseStringNullish(defaultString, ''), null)
  })

  await t.test('returns `string` if `string.length > 0`', async () => {
    const string = 'myString'
    assert.strictEqual(parseStringNullish(defaultString, string), string)
  })
})
