import { capitalize } from '../utils/capitalize'

/** returns true if the field value is one of the possible values otherwise throws an error */
export const onlyPossibleValuesValidation = async (
  possibleValues: readonly string[],
  fieldName: string,
  fieldValue: string
): Promise<boolean> => {
  if (!possibleValues.includes(fieldValue)) {
    return await Promise.reject(
      new Error(
        `${capitalize(
          fieldName
        )} should be one of these values : ${possibleValues.join(', ')}`
      )
    )
  }
  return true
}
