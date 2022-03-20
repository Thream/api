import tap from 'tap'

import { buildQueryURL } from '../buildQueryURL.js'

await tap.test('tools/utils/buildQueryUrl', async (t) => {
  t.equal(
    buildQueryURL('http://localhost:8080', {
      test: 'query'
    }),
    'http://localhost:8080/?test=query'
  )
  t.equal(
    buildQueryURL('http://localhost:8080/', {
      test: 'query'
    }),
    'http://localhost:8080/?test=query'
  )
  t.equal(
    buildQueryURL('http://localhost:3000', {
      test: 'query',
      code: 'abc'
    }),
    'http://localhost:3000/?test=query&code=abc'
  )
})
