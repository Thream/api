/**
 * Parse a nullish string:
 *  - if `string === undefined`, it returns `defaultString`
 *  - if `string === null`, it returns `null`
 *  - if `string.length === 0`, it returns `null`
 *  - else, it returns `string`
 * @param defaultString
 * @param string
 * @returns
 */
export const parseStringNullish = (
  defaultString: string | null,
  string?: string | null,
): string | null => {
  if (string === undefined) {
    return defaultString
  }
  if (string === null) {
    return null
  }
  if (string.length === 0) {
    return null
  }
  return string
}
