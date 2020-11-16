import { ObjectAny } from '../../../typings/utils'

export const buildQueryURL = (
  baseURL: string,
  queryObject: ObjectAny
): string => {
  const url = new URL(baseURL)
  Object.entries(queryObject).forEach(([query, value]) => {
    url.searchParams.append(query, value)
  })
  return url.href
}
