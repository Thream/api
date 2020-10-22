import { capitalize } from '../capitalize'

test('utils/capitalize', () => {
  expect(capitalize('hello world')).toBe('Hello world')
  expect('Test').toBe('Test')
  expect('TEST').toBe('TEST')
})
