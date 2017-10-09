import isPlainObject from 'is-plain-object';

import {
  curry,
  equals,
  is,
  type
} from 'ramda';

import isFunction from './isFunction';
import throwError from './throwError';


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
export default curry((callee, types, label, value) => {
  types = [].concat(types);

  const match = types.reduce((accumulator, type) => {
    let predicateFn;

    switch (type) {
      case Object:
        predicateFn = isPlainObject;
        break;
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
