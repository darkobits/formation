// -----------------------------------------------------------------------------
// ----- Utilities -------------------------------------------------------------
// -----------------------------------------------------------------------------

import R from 'ramda';

import {
  MODULE_NAME
} from 'formation/etc/constants';


/**
 * @memberOf utils
 * @function capitalize
 * @private
 *
 * @description
 *
 * Capitalizes the first character in the provided string.
 *
 * @param  {string} str
 * @return {string}
 */
export function capitalize (str) {
  return str && String(str).substr(0, 1).toUpperCase() + String(str).substr(1);
}


/**
 * @memberOf utils
 * @function lowercase
 * @private
 *
 * @description
 *
 * Lowercases the first character in the provided string.
 *
 * @param  {string} str
 * @return {string}
 */
export function lowercase (str) {
  return str && String(str).substr(0, 1).toLowerCase() + String(str).substr(1);
}


/**
 * @memberOf utils
 * @function mergeWithDeep
 * @private
 *
 * @description
 *
 * Recursive version of R.mergeWith.
 *
 * @param  {function} f - Merging function.
 * @param  {arglist} objs - Objects to merge (right to left.)
 * @return {object}
 */
export function mergeWithDeep (f, ...objs) {
  if (objs.length >= 2) {
    const d = R.clone(R.nth(-2, objs)) || {};
    const s = R.nth(-1, objs) || {};
    const merged = R.mergeWith(f, d, s);

    if (objs.length === 2) {
      return merged;
    } else {
      const rest = R.slice(0, -2, objs);
      return mergeWithDeep(f, ...R.append(merged, rest));
    }
  } else if (objs.length === 1) {
    return R.head(objs);
  } else {
    return {};
  }
}


/**
 * @memberOf utils
 * @function DEFAULT_MERGER
 * @private
 *
 * @description
 *
 * Default merging function.
 *
 * - If values are primitives, use the value from source object, overwriting the
 *   value in the destination object.
 * - If values are arrays, the source array is appended to the destination
 *   array. (Important for merging arrays of ngMessages.)
 * - If values are objects, deep merge them.
 *
 * @param  {object} d - Destination object.
 * @param  {object} s - Source object.
 * @return {object} - Merged object.
 */
const DEFAULT_MERGER = (d, s) => {
  if (Array.isArray(d) && Array.isArray(s)) {
    return R.concat(d, s);
  } else if (R.is(Object, d) && R.is(Object, s) && !R.is(Function, s)) {
    return mergeWithDeep(DEFAULT_MERGER, d, s);
  } else {
    return s;
  }
};


/**
 * @memberOf utils
 * @function mergeDeep
 * @private
 *
 * @description
 *
 * Partially-applied version of mergeWithDeep using the default merger.
 *
 * @param  {arglist} objs - Objects to merge.
 * @return {object} - Merged object.
 */
export const mergeDeep = (...objs) => {
  return mergeWithDeep(DEFAULT_MERGER, ...objs);
};


/**
 * @memberOf utils
 * @function throwError
 * @private
 *
 * @description
 *
 * Throws a new error with the provided message, prefixed with the module
 * name.
 *
 * @param  {string} message
 */
export function throwError (message) {
  throw new Error(`[${MODULE_NAME}] ${message}`);
}


export default {
  capitalize,
  mergeWithDeep,
  mergeDeep,
  throwError
};
