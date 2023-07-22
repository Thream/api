import { URL } from 'node:url'

export interface ObjectAny {
  [key: string]: any
}

export const buildQueryURL = (
  baseURL: string,
  queryObject: ObjectAny
): string => {
  const url = new URL(baseURL)
  for (const [query, value] of Object.entries(queryObject)) {
    url.searchParams.append(query, value)
  }
  return url.href
}
