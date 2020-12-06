import { buildQueryURL } from '../buildQueryURL'

test('controllers/users/utils/buildQueryUrl', () => {
  expect(
    buildQueryURL('http://localhost:8080', {
      test: 'query'
    })
  ).toEqual('http://localhost:8080/?test=query')
  expect(
    buildQueryURL('http://localhost:8080/', {
      test: 'query'
    })
  ).toEqual('http://localhost:8080/?test=query')
  expect(
    buildQueryURL('http://localhost:3000', {
      test: 'query',
      code: 'abc'
    })
  ).toEqual('http://localhost:3000/?test=query&code=abc')
})
