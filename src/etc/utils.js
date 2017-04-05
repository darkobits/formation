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
    return R.concat(s, d);
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


/**
 * Generates a list of pairs/entries from a collection using the provided
 * key/value generation functions.
 *
 * If called with 2 arguments, they will be interpreted as [keyFn, collection],
 * and values will be each member in the collection.
 *
 * If called with 3 arguments, they will be interpreted as
 * [keyFn, valueFn, collection].
 *
 * @param  {arglist} args - Key generation function, optional value generation
 *   function, and collection.
 * @return {array}
 */
export function toPairsWith (...args) {
  let keyFn = R.identity;
  let valueFn = R.identity;
  let collection = [];

  switch (args.length) {
    case 1:
      throw new Error('toPairsWith expects at least 2 arguments.');
    case 3:
      [keyFn, valueFn, collection] = args;
      break;
    case 2:
    default:
      [keyFn, collection] = args;
      break;
  }

  return collection.map(item => [keyFn(item), valueFn(item)]);
}


/**
 * Provided two lists of [key, value] entries, such as those generated using
 * Object.entries or Map.prototype.entries, returns a list of
 * [key, valueA, valueB] triplets by matching each entry in the source list with
 * each of its corresponding entries in the destination list. Extraneous entries
 * in the source list will be dropped.
 *
 * @param  {array}  dest - Destination set of entries.
 * @param  {array}  src  - Source set of entries.
 * @return {array}
 */
export function mergeEntries (dest = [], src = []) {
  return dest.map(destEntry => {
    const match = src.find(srcEntry => srcEntry[0] === destEntry[0]);
    return [destEntry[0], destEntry[1], match ? match[1] : undefined];
  });
}


/**
 * Invokes the named method on the provided object (if it exists), optionally
 * passing any additional arguments as parameters to the method.
 *
 * @param  {string}    method - Method name to invoke.
 * @param  {object}    obj    - Target object.
 * @param  {arglist}   [args] - Additional arguments to pass to 'method'.
 * @return {*}
 */
export function invoke (method, obj, ...args) {
  return obj && R.is(Function, obj[method]) && obj[method](...args);
}



export function delegateToRegistry (registry, methodToInvoke, data) {
  // Convert registry array to registry entries in the format [name, member].
  const registryAsEntries = toPairsWith(R.prop('name'), registry);

  // Convert data object to entries in the format [key, data].
  const dataAsEntries = Object.entries(data || {});

  // Correlate data to registry members by common name/key, generating
  // triplets in the format [name, member, data].
  const mergedEntries = mergeEntries(registryAsEntries, dataAsEntries);

  // For each triplet, invoke the provided method name on the member, passing
  // it its matching data.
  R.forEach(([, member, data]) => {
    invoke(methodToInvoke, member, data);
  }, mergedEntries);
}


export default {
  capitalize,
  mergeWithDeep,
  mergeDeep,
  throwError,
  onReady,
  toPairsWith,
  mergeEntries,
  invoke,
  delegateToRegistry
};
