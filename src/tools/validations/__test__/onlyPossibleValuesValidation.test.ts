import { onlyPossibleValuesValidation } from '../onlyPossibleValuesValidation'

describe('/tools/validations/onlyPossibleValuesValidation', () => {
  it('returns true if the value is one of the possible values', async () => {
    expect(
      await onlyPossibleValuesValidation(
        ['awesome', 'second possible value'],
        'title',
        'awesome'
      )
    ).toBeTruthy()
  })

  it("throws an error if the value isn't in the possible values", async () => {
    await expect(
      onlyPossibleValuesValidation(
        ['awesome', 'second possible value'],
        'title',
        'random value'
      )
    ).rejects.toThrowError()
  })
})
