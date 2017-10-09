import {identity} from 'ramda';
import isFunction from './isFunction';
import throwError from './throwError';


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
export default function toPairsWith (...args) {
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
