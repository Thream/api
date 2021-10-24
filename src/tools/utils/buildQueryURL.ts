import { URL } from 'node:url'

export interface ObjectAny {
  [key: string]: any
}

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
