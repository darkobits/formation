// -----------------------------------------------------------------------------
// ----- Utilities -------------------------------------------------------------
// -----------------------------------------------------------------------------

/**
 * TODO: Consider replacing mergeDeep with webpack-merge et. al.
 */

import {
  append,
  clone,
  concat,
  curry,
  equals,
  filter,
  head,
  identity,
  is,
  map,
  mergeWith,
  nth,
  path,
  slice,
  type
} from 'ramda';

import {
  MODULE_NAME
} from './constants';


/**
 * Throws an error if the provided value is not a [key, value] entry. Otherwise,
 * returns true.
 *
 * @param  {any} value
 * @param  {string} [label] - Optional label.
 * @return {boolean}
 */
export function assertIsEntry (value, label) {
  if (!Array.isArray(value) || value.length !== 2) {
    throwError([
      `Expected ${label ? label + ' to be a ' : ''}[key, value] entry,`,
      `but got ${type(value)}.`
    ].join(' '));
  }

  return true;
}


/**
 * Returns true if the provided value is not undefined.
 *
 * @param  {any} value
 * @return {boolean}
 */
export function isDefined (value) {
  return value !== undefined;
}


/**
 * Because Jest's mocked functions fail a Function type check, we need to
 * additionally check their "typeof" property.
 *
 * @param  {any} value
 * @return {boolean}
 */
export function isFunction (value) {
  return is(Function, value) || typeof value === 'function';
}


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
 * Checks the type of a value and throws an error if it does not match one of
 * the provided types.
 *
 * @param  {string} callee - Label of the method/process to use in errors.
 * @param  {function|array} types - Constructor/class or list of constructors
 *   and classes to check against.
 * @param  {string} label  - Label for the value being checked, used in errors.
 * @param  {any} value  - Value to check.
 *
 * @return {boolean} - True if types match, throws otherwise.
 */
export const assertType = curry((callee, types, label, value) => {
  types = [].concat(types);

  const match = types.reduce((accumulator, type) => {
    let predicateFn;

    switch (type) {
      case Function:
        predicateFn = isFunction;
        break;
      case Array:
        predicateFn = Array.isArray;
        break;
      case undefined:
        predicateFn = equals(undefined);
        break;
      case null:
        predicateFn = equals(null);
        break;
      default:
        predicateFn = is(type);
        break;
    }

    return accumulator || predicateFn(value);
  }, false);

  if (!match) {
    const typeNames = types.map(ctor => {
      try {
        return ctor.prototype.constructor.name;
      } catch (err) {
        return type(ctor);
      }
    }).join(' or ');

    throwError([
      `${callee} expected ${label} to be of type`,
      `${typeNames},`,
      `but got ${type(value)}.`
    ].join(' '));
  }

  return true;
});


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
    const d = clone(nth(-2, objs)) || {};
    const s = nth(-1, objs) || {};
    const merged = mergeWith(f, d, s);

    if (objs.length === 2) {
      return merged;
    }

    const rest = slice(0, -2, objs);
    return mergeWithDeep(f, ...append(merged, rest));
  } else if (objs.length === 1) {
    return head(objs);
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
    return concat(d, s);
  } else if (is(Object, d) && is(Object, s) && !isFunction(s)) {
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

  const states = map(state => {
    return state.length && `$${state.replace(/[, ]/g, '')}`;
  }, String(string).split(/, ?| /g));

  return filter(identity, states);
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
export const assignToScope = curry(($parse, scope, value, expression) => {
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
  let keyFn = identity;
  let valueFn = identity;
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

  if (!isFunction(keyFn)) {
    throwError(`Expected key generation function to be of type "Function", but got "${typeof keyFn}".`);
  }

  if (!isFunction(valueFn)) {
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
  const check = assertType('mergeEntries');

  check(Array, 'first argument', dest);
  check(Array, 'second argument', src);

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
  return obj && isFunction(obj[method]) && obj[method](...args);
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
  const aId = path(['$id'], invoke('$getScope', a)) || 0;
  const bId = path(['$id'], invoke('$getScope', b)) || 0;
  return Number(aId) > Number(bId) ? a : b;
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
export function applyToCollection (collection, entryFn, memberFn, data) {
  // Convert collection to entries using the provided entry generation function.
  const collectionEntries = toPairsWith(entryFn, collection);

  // Convert data object to entries in the format [key, value].
  const dataEntries = Object.entries(data || {});

  // Correlate data to registry members by common name/key, generating
  // triplets in the format [name, member, data].
  const mergedEntries = mergeEntries(collectionEntries, dataEntries);

  // For each triplet, invoke the provided method name on the collection member,
  // passing it its matching data. Return an entry in the format
  // [name, returnValue].
  return map(([name, member, data]) => {
    return [name, invoke(memberFn, member, data)];
  }, mergedEntries);
}


export default {
  applyToCollection,
  assertIsEntry,
  assertType,
  assignToScope,
  capitalizeFirst,
  greaterScopeId,
  invoke,
  isDefined,
  isFunction,
  lowercaseFirst,
  mergeDeep,
  mergeEntries,
  mergeWithDeep,
  onReady,
  parseFlags,
  throwError,
  toPairsWith
};
