/**
 * Parse a nullish string:
 *  - if `string.length === 0`, it returns `null`
 *  - if `string == null`, it returns `defaultString`
 *  - if `string.length > 0`, it returns `string`
 * @param defaultString
 * @param string
 * @returns
 */
export const parseStringNullish = (
  defaultString: string | null,
  string?: string
): string | null => {
  if (string != null) {
    if (string.length > 0) {
      return string
    }
    return null
  }
  return defaultString
}
