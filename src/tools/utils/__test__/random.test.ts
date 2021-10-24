import {
  randomCharacter,
  randomInteger,
  randomString,
  alphabet
} from '../random'

describe('/tools/utils/random', () => {
  test('randomInteger', () => {
    const min = 1
    const max = 100
    const result = randomInteger(min, max)
    const isInteger = result % 1 === 0
    expect(isInteger).toBeTruthy()
    expect(result).toBeGreaterThanOrEqual(min)
    expect(result).toBeLessThanOrEqual(max)
  })

  test('randomCharacter', () => {
    const result = randomCharacter()
    expect(result.length).toEqual(1)
    expect(alphabet.split('').includes(result))
  })

  test('randomString', () => {
    const length = 7
    const result = randomString(length)
    expect(result.length).toEqual(length)
  })
})
