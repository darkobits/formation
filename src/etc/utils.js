// -----------------------------------------------------------------------------
// ----- Utilities -------------------------------------------------------------
// -----------------------------------------------------------------------------

/**
 * TODO: Consider replacing mergeDeep with webpack-merge, especially if it can
 * be used with tree-shaking.
 */


import R from 'ramda';

import {
  MODULE_NAME
} from './constants';


/**
 * Throws a new error with the provided message, prefixed with the module
 * name.
 *
 * @param  {string} message
 */
export function throwError (message) {
  throw new Error(`[${MODULE_NAME}] ${message}`);
}


/**
 * Throws an error if the provided value is not an array. Otherwise, returns
 * true.
 *
 * @param  {*} value
 * @param  {string} [desc] - Optional descriptor.
 * @return {boolean}
 */
function assertIsArray (value, desc) {
  if (!Array.isArray(value)) {
    throwError(`Expected ${desc ? desc + ' to be of type ' : ''}"Array", but got "${typeof value}".`);
  }

  return true;
}


/**
 * Throws an error if the provided value is not a [key, value] entry. Otherwise,
 * returns true.
 *
 * @param  {*} value
 * @param  {string} [desc] - Optional descriptor.
 * @return {boolean}
 */
function assertIsEntry (value, desc) {
  if (!Array.isArray(value) || value.length !== 2) {
    throwError(`Expected ${desc ? desc + ' to be of type ' : ''}[key, value] entry, but got "${JSON.stringify(value)}".`);
  }

  return true;
}


/**
 * Capitalizes the first character in the provided string.
 *
 * @param  {string} str
 * @return {string}
 */
export function capitalizeFirst (str) {
  return str && String(str).substr(0, 1).toUpperCase() + String(str).substr(1);
}


/**
 * Lowercases the first character in the provided string.
 *
 * @param  {string} str
 * @return {string}
 */
export function lowercaseFirst (str) {
  return str && String(str).substr(0, 1).toLowerCase() + String(str).substr(1);
}


/**
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
 * Partially-applied version of mergeWithDeep using the default merger.
 *
 * @param  {arglist} objs - Objects to merge.
 * @return {object} - Merged object.
 */
export const mergeDeep = (...objs) => {
  return mergeWithDeep(DEFAULT_MERGER, ...objs);
};





/**
 * Accepts a comma/space-delimited list of strings and returns an array of
 * $-prefixed strings.
 *
 * @example
 *
 * "touched, submitted" => ['$touched', '$submitted']
 *
 * @private
 *
 * @param  {string} string
 * @return {array}
 */
export function parseFlags (string) {
  if (!string || string === '') {
    return;
  }

  const states = R.map(state => {
    return state.length && `$${state.replace(/[, ]/g, '')}`;
  }, String(string).split(/, ?| /g));

  return R.filter(R.identity, states);
}


/**
 * Spies on a key in the provided object and returns a promise that resolves
 * when the value becomes defined or rejects when a timeout is reached.
 *
 * @param  {object} obj - Base object.
 * @param  {string} key - Key in base object to spy on.
 * @param  {number} [timeout=10000] - Timeout period. Default is 10 seconds.
 * @return {promise<*>} - Promise that resolves with the value at the named key
 *   once it is defined.
 */
export function onReady (obj, key, timeout = 1000) {
  const start = new Date().getTime() / 1000;

  return new Promise((resolve, reject) => {
    const cancel = setInterval(() => {
      const now = new Date().getTime() / 1000;

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
 * Assigns a value to an expression on the provided scope.
 *
 * @param {object} $parse - Angular $parse service.
 * @param {object} scope - Angular scope to assign to.
 * @param {*}      value - Value to assign to scope.
 * @param {string} expression - Expression in scope's parent to assign value to.
 */
export const assignToScope = R.curry(($parse, scope, value, expression) => {
  let setter;

  if (expression === '') {
    setter = $parse('this[""]').assign;
  } else {
    setter = $parse(expression).assign;
  }

  if (setter) {
    setter(scope, value);
  }
});


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

  if (!R.is(Function, keyFn)) {
    throwError(`Expected key generation function to be of type "Function", but got "${typeof keyFn}".`);
  }

  if (!R.is(Function, valueFn)) {
    throwError(`Expected key value generation function to be of type "Function", but got "${typeof valueFn}".`);
  }

  if (!Array.isArray(collection)) {
    throwError(`Expected collection to be of type "Array", but got "${typeof collection}".`);
  }

  return collection.map((...args) => [String(keyFn(...args)), valueFn(...args)]);
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
  assertIsArray(dest, 'first argument');
  assertIsArray(src, 'second argument');

  return dest.map(destEntry => {
    assertIsEntry(destEntry);
    const match = src.find(srcEntry => assertIsEntry(srcEntry) && (srcEntry[0] === destEntry[0]));
    return [destEntry[0], destEntry[1], match ? match[1] : undefined];
  });
}


/**
 * Invokes the named method on the provided object (if it exists), optionally
 * passing any additional arguments as parameters to the method.
 *
 * @param  {string}  method - Method name to invoke.
 * @param  {object}  obj    - Target object.
 * @param  {arglist} [args] - Additional arguments to pass to 'method'.
 * @return {*}
 */
export function invoke (method, obj, ...args) {
  return obj && R.is(Function, obj[method]) && obj[method](...args);
}


/**
 * Provided two objects that implement a '$getScope' method, returns the
 * object with the greater $scope id. This is used to determine which object
 * is likely to be lowe in the scope hierarchy.
 *
 * @param  {object} a
 * @param  {object} b
 * @return {object}
 */
export function greaterScopeId (a, b) {
  const aId = R.path(['$id'], invoke('$getScope', a));
  const bId = R.path(['$id'], invoke('$getScope', b));
  return aId > bId ? a : b;
}


/**
 * Applies a set of data to each member in a collection by matching data to
 * members and invoking a method on each member, passing it a data fragment.
 *
 * @example
 *
 * const collection = [
 *   {
 *     id: '1',
 *     setName: name => {
 *       this.name = name;
 *     }
 *   },
 *   {
 *     id: '2',
 *     setName: => {
 *       this.name = name;
 *     }
 *   }
 * ];
 *
 * const data = {
 *   '1': 'foo',
 *   '2': 'bar'
 * };
 *
 * // This will set the first item's name to 'foo', and the second item's name
 * // to 'bar', based on matching keys in 'data' to 'id' in collection members.
 * applyToCollection(collection, R.prop('id'), 'setName', data);
 *
 * @param {array} collection - Collection to apply data to.
 * @param {function} entryFn - Function to pass to toPairsWith to generate the
 *   key (left hand side) for each entry in 'collection'.
 * @param {string} memberFn - The function to invoke on each member in the
 *   collection to pass matched data fragments to.
 * @param {object|array} data - Data to disperse to members of 'collection'.
 */
export const applyToCollection = R.curry((collection, entryFn, memberFn, data) => {
  // Convert registry array to registry entries in the format [name, member].
  const collectionEntries = toPairsWith(entryFn, collection);

  // Convert data object to entries in the format [key, data].
  const dataEntries = Object.entries(data || {});

  // Correlate data to registry members by common name/key, generating
  // triplets in the format [name, member, data].
  const mergedEntries = mergeEntries(collectionEntries, dataEntries);

  // For each triplet, invoke the provided method name on the member, passing
  // it its matching data.
  return R.map(([name, member, data]) => [name, invoke(memberFn, member, data)], mergedEntries);
});


export default {
  applyToCollection,
  assignToScope,
  capitalizeFirst,
  greaterScopeId,
  invoke,
  lowercaseFirst,
  mergeDeep,
  mergeEntries,
  mergeWithDeep,
  onReady,
  parseFlags,
  throwError,
  toPairsWith
};
