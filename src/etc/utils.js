// -----------------------------------------------------------------------------
// ----- Utilities -------------------------------------------------------------
// -----------------------------------------------------------------------------

import R from 'ramda';

import {
  MODULE_NAME
} from './constants';


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
    }

    const rest = R.slice(0, -2, objs);
    return mergeWithDeep(f, ...R.append(merged, rest));
  } else if (objs.length === 1) {
    return R.head(objs);
  }

  return {};
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
  }

  return s;
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



/**
 * @memberOf utils
 * @function onReady
 *
 * @description
 *
 * Spies on a key in the provided object and returns a promise that resolves
 * when the value becomes defined or rejects when a timeout is reached.
 *
 * @param  {object} obj - Base object.
 * @param  {string} key - Key in base object to spy on.
 * @param  {Number} [timeout=10000] - Timeout period. Default is 10 seconds.
 * @return {promise<*>} - Promise that resolves with the value at the named key
 *   once it is defined.
 */
export function onReady (obj, key, timeout = 10000) {
  const start = performance.now();

  return new Promise((resolve, reject) => {
    const cancel = setInterval(() => {
      const now = performance.now();

      if (obj[key] !== undefined) {
        resolve(obj[key]);
        clearInterval(cancel);
      } else if (now - start > timeout) {
        reject(new Error('[onReady] Timed-out.'));
        clearInterval(cancel);
      }
    }, 1);
  });
}


export default {
  capitalize,
  mergeWithDeep,
  mergeDeep,
  throwError,
  onReady
};
