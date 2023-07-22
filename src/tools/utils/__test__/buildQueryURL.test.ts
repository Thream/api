import test from 'node:test'
import assert from 'node:assert/strict'

import { buildQueryURL } from '../buildQueryURL.js'

await test('tools/utils/buildQueryUrl', async () => {
  assert.strictEqual(
    buildQueryURL('http://localhost:8080', {
      test: 'query'
    }),
    'http://localhost:8080/?test=query'
  )
  assert.strictEqual(
    buildQueryURL('http://localhost:8080/', {
      test: 'query'
    }),
    'http://localhost:8080/?test=query'
  )
  assert.strictEqual(
    buildQueryURL('http://localhost:3000', {
      test: 'query',
      code: 'abc'
    }),
    'http://localhost:3000/?test=query&code=abc'
  )
})
