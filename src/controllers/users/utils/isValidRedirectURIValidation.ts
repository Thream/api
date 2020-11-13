import { authorizedRedirectDomains } from '../../../utils/config/constants'

export const isValidRedirectURIValidation = async (
  redirectURI: string
): Promise<boolean> => {
  const isValidRedirectURI = authorizedRedirectDomains.some(domain => {
    return redirectURI.startsWith(domain)
  })
  if (!isValidRedirectURI) {
    return await Promise.reject(new Error('Untrusted URL redirection'))
  }
  return true
}
