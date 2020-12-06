import { isValidRedirectURIValidation } from '../isValidRedirectURIValidation'

test('controllers/users/utils/isValidRedirectURIValidation', async () => {
  expect(
    await isValidRedirectURIValidation('https://thream.divlo.fr/')
  ).toBeTruthy()
})
