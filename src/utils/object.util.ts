/**
 * Filters an object and returns a new object containing only the specified fields.
 * @param obj The object to filter.
 * @param allowedFields The names of the fields to include in the returned object.
 * @returns A new object containing only the specified fields.
 * @example
 * const user = {
 *   name: 'Collins',
 *   age: 30,
 *   email: 'collinsbenda360@gmail.com',
 *   address: {
 *     street: '123 Main St',
 *     city: 'kampala',
 *     state: 'CA',
 *     zip: '12345'
 *   }
 * };
 * // assuming you want a user with the email and name field only
 * const filteredUser = selectObjFields(user, 'name', 'email');
 * // filteredUser: { name: 'John', email: 'john@example.com' }
 */
export const selectObjFields = (obj: Record<string, unknown>, ...allowedFields: string[]): Record<string, unknown> => {
  const newObj: Record<string, unknown> = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * Returns a new object with all properties of the input object except for those with the excluded field names.
 * @param obj - The input object to filter.
 * @param excludedFields - The field names to exclude from the returned object.
 * @returns A new object with all properties of the input object except for those with the excluded field names.
 * @example
 * const user = {
 *   name: 'atuhaire',
 *   age: 30,
 *   email: 'atuhairecollins360@gmail.com',
 *   address: {
 *     street: '123 Main St',
 *     city: 'kampala',
 *     state: 'CA',
 *     zip: '12345'
 *   }
 * };
 * // assuming you want a user with the email and name field only
 * const filteredUser = excludeObj(user, 'age', 'address');
 * // filteredUser: { name: 'John', email: 'john@example.com' }
 */
export const excludeObjFields = (obj: Record<string, any>, ...excludedFields: string[]): Record<string, any> => {
  const newObj: Record<string, any> = {};
  Object.keys(obj).forEach((el) => {
    if (!excludedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
